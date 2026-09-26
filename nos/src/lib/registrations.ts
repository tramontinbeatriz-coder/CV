import { randomBytes } from "node:crypto";
import { and, eq, gt, ne, sql } from "drizzle-orm";
import { db } from "./db";
import { events, paymentEvents, registrations, waitlistEntries, type PaymentStatus, type Registration } from "./db/schema";
import { config } from "./config";
import { activeHoldsByEvent, toView } from "./events";
import { canRegister } from "./spots";
import { getPaymentProvider, type PaymentUpdate } from "./payments";
import { sendRegistrationConfirmation } from "./notifications";

export type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
  instagram?: string | null;
  city?: string | null;
  discoverySource?: string | null;
};

export class RegistrationError extends Error {
  constructor(
    readonly code: "not_found" | "unavailable" | "already_registered" | "payment_error",
    message: string,
  ) {
    super(message);
  }
}

/**
 * Cria a inscrição reservando uma vaga por SPOT_HOLD_MINUTES e devolve para onde
 * a pessoa deve ir: o checkout do provedor, ou direto a confirmação (evento gratuito).
 *
 * A verificação de vagas + criação acontece numa transação de escrita, então duas
 * pessoas não conseguem ficar com a última vaga ao mesmo tempo.
 */
export async function startRegistration(eventSlug: string, input: RegistrationInput) {
  const email = input.email.trim().toLowerCase();
  const now = new Date();
  const holdUntil = new Date(now.getTime() + config.spotHoldMinutes * 60_000).toISOString();

  const result = await db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.slug, eventSlug)).limit(1);
    if (!event || !event.published) throw new RegistrationError("not_found", "encontro não encontrado");

    const [existingPaid] = await tx
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(eq(registrations.eventId, event.id), eq(registrations.email, email), eq(registrations.paymentStatus, "paid")))
      .limit(1);
    if (existingPaid) {
      throw new RegistrationError("already_registered", "esse e-mail já tem um lugar confirmado nesse encontro 🤍");
    }

    // Se a pessoa voltou com uma reserva ainda válida, reaproveita (não segura 2 vagas).
    const [pendingHold] = await tx
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.eventId, event.id),
          eq(registrations.email, email),
          eq(registrations.paymentStatus, "pending"),
          gt(registrations.holdExpiresAt, now.toISOString()),
        ),
      )
      .limit(1);
    if (pendingHold) {
      const [updated] = await tx
        .update(registrations)
        .set({
          name: input.name.trim(),
          phone: input.phone.trim(),
          instagram: input.instagram?.trim() || null,
          city: input.city?.trim() || null,
          discoverySource: input.discoverySource?.trim() || null,
          holdExpiresAt: holdUntil,
          updatedAt: now.toISOString(),
        })
        .where(eq(registrations.id, pendingHold.id))
        .returning();
      return { event, registration: updated, reused: true };
    }

    const holds = await activeHoldsByEvent([event.id], tx);
    const view = toView(event, holds.get(event.id) ?? 0);
    if (!canRegister(view.effective)) {
      throw new RegistrationError("unavailable", "as inscrições para esse encontro não estão abertas");
    }

    const [registration] = await tx
      .insert(registrations)
      .values({
        eventId: event.id,
        publicToken: randomBytes(18).toString("base64url"),
        name: input.name.trim(),
        email,
        phone: input.phone.trim(),
        instagram: input.instagram?.trim() || null,
        city: input.city?.trim() || null,
        discoverySource: input.discoverySource?.trim() || null,
        acceptedTermsAt: now.toISOString(),
        amountCents: event.priceCents,
        paymentProvider: event.priceCents > 0 ? config.paymentProvider : "gratuito",
        holdExpiresAt: holdUntil,
      })
      .returning();
    return { event, registration, reused: false };
  });

  const { event, registration } = result;

  if (event.priceCents === 0) {
    await confirmRegistration(registration.id, { reference: "gratuito" });
    return { redirectTo: `/confirmacao/${registration.publicToken}`, registration };
  }

  if (result.reused && registration.checkoutUrl && registration.paymentProvider === config.paymentProvider) {
    return { redirectTo: registration.checkoutUrl, registration };
  }

  try {
    const provider = getPaymentProvider();
    const checkout = await provider.createCheckout({ registration, event });
    await db
      .update(registrations)
      .set({
        paymentProvider: provider.id,
        providerReference: checkout.reference,
        checkoutUrl: checkout.url,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(registrations.id, registration.id));
    return { redirectTo: checkout.url, registration };
  } catch (err) {
    console.error("[checkout]", err);
    // libera a vaga
    await db
      .update(registrations)
      .set({ paymentStatus: "failed", holdExpiresAt: null, notes: "erro ao criar checkout" })
      .where(eq(registrations.id, registration.id));
    throw new RegistrationError("payment_error", "não conseguimos abrir o pagamento agora. tenta de novo em instantes?");
  }
}

/**
 * Marca como paga (idempotente), soma a vaga ocupada e envia a confirmação.
 * Se o pagamento chegar depois da reserva expirar e o evento já estiver cheio,
 * a inscrição é confirmada mesmo assim e marcada como "overbooked" para a equipe decidir.
 */
export async function confirmRegistration(registrationId: string, opts: { reference?: string } = {}) {
  const outcome = await db.transaction(async (tx) => {
    const [reg] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    if (!reg) return null;
    if (reg.paymentStatus === "paid") return { reg, changed: false };

    const [event] = await tx.select().from(events).where(eq(events.id, reg.eventId)).limit(1);
    const holdStillValid = reg.holdExpiresAt != null && reg.holdExpiresAt > new Date().toISOString();
    const otherHolds = (await activeHoldsByEvent([event.id], tx)).get(event.id) ?? 0;
    const holdsExcludingMine = otherHolds - (holdStillValid && reg.paymentStatus === "pending" ? 1 : 0);
    const overbooked = event.spotsTaken + holdsExcludingMine >= event.totalSpots;

    const now = new Date().toISOString();
    const res = await tx
      .update(registrations)
      .set({
        paymentStatus: "paid",
        paidAt: now,
        holdExpiresAt: null,
        overbooked,
        providerReference: opts.reference ?? reg.providerReference,
        updatedAt: now,
      })
      .where(and(eq(registrations.id, reg.id), ne(registrations.paymentStatus, "paid")))
      .returning();
    if (res.length === 0) return { reg, changed: false };

    await tx
      .update(events)
      .set({ spotsTaken: sql`${events.spotsTaken} + 1`, updatedAt: now })
      .where(eq(events.id, event.id));
    return { reg: res[0], changed: true, event };
  });

  if (outcome?.changed && outcome.event) {
    const sent = await sendRegistrationConfirmation(outcome.reg, outcome.event);
    if (sent) {
      await db
        .update(registrations)
        .set({ confirmationSentAt: new Date().toISOString() })
        .where(eq(registrations.id, outcome.reg.id));
    }
  }
  return outcome?.reg ?? null;
}

/**
 * Muda o status de pagamento mantendo a contagem de vagas certa.
 * Usado pelos webhooks (recusado/cancelado/estornado) e pelo painel.
 */
export async function setPaymentStatus(registrationId: string, status: PaymentStatus) {
  if (status === "paid") return confirmRegistration(registrationId, { reference: undefined });
  return db.transaction(async (tx) => {
    const [reg] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    if (!reg || reg.paymentStatus === status) return reg ?? null;
    const now = new Date().toISOString();
    const [updated] = await tx
      .update(registrations)
      .set({ paymentStatus: status, holdExpiresAt: null, updatedAt: now })
      .where(eq(registrations.id, reg.id))
      .returning();
    if (reg.paymentStatus === "paid") {
      await tx
        .update(events)
        .set({ spotsTaken: sql`max(${events.spotsTaken} - 1, 0)`, updatedAt: now })
        .where(eq(events.id, reg.eventId));
    }
    return updated;
  });
}

/** Aplica o resultado de um webhook/consulta ao provedor. */
export async function applyPaymentUpdate(update: PaymentUpdate, provider: string, payload?: unknown) {
  await db.insert(paymentEvents).values({
    provider,
    registrationId: update.registrationId,
    type: update.outcome,
    payload: payload ? JSON.stringify(payload).slice(0, 20_000) : null,
  });
  switch (update.outcome) {
    case "paid":
      return confirmRegistration(update.registrationId, { reference: update.reference });
    case "pending":
      return null;
    default: {
      // Não "despaga" uma inscrição por causa de uma tentativa recusada depois de aprovada.
      const [reg] = await db.select().from(registrations).where(eq(registrations.id, update.registrationId));
      if (reg?.paymentStatus === "paid" && update.outcome !== "refunded") return reg;
      return setPaymentStatus(update.registrationId, update.outcome);
    }
  }
}

/** Na volta do checkout, pergunta ao provedor se já foi pago (não depende só do webhook). */
export async function syncWithProvider(registration: Registration) {
  if (registration.paymentStatus !== "pending" || !registration.paymentProvider) return registration;
  try {
    const provider = getPaymentProvider(registration.paymentProvider);
    if (!provider.fetchStatus) return registration;
    const update = await provider.fetchStatus(registration);
    if (update && update.outcome !== "pending") {
      await applyPaymentUpdate(update, provider.id);
      const [fresh] = await db.select().from(registrations).where(eq(registrations.id, registration.id));
      return fresh;
    }
  } catch (err) {
    console.error("[sync pagamento]", err);
  }
  return registration;
}

export async function getRegistrationByToken(token: string) {
  const [row] = await db
    .select({ registration: registrations, event: events })
    .from(registrations)
    .innerJoin(events, eq(events.id, registrations.eventId))
    .where(eq(registrations.publicToken, token))
    .limit(1);
  return row ?? null;
}

export async function joinWaitlist(eventSlug: string, input: Omit<RegistrationInput, "city" | "discoverySource">) {
  const [event] = await db.select().from(events).where(eq(events.slug, eventSlug)).limit(1);
  if (!event || !event.published) throw new RegistrationError("not_found", "encontro não encontrado");
  const email = input.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: waitlistEntries.id })
    .from(waitlistEntries)
    .where(and(eq(waitlistEntries.eventId, event.id), eq(waitlistEntries.email, email)))
    .limit(1);
  if (existing) return existing;
  const [entry] = await db
    .insert(waitlistEntries)
    .values({
      eventId: event.id,
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      instagram: input.instagram?.trim() || null,
    })
    .returning();
  return entry;
}
