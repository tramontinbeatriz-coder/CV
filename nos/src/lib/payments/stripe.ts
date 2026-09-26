import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config";
import type { PaymentProvider, PaymentUpdate } from "./types";
import { WebhookError } from "./types";

/**
 * Stripe Checkout (cartão e, se ativado na conta, Pix).
 * Docs: https://docs.stripe.com/payments/checkout
 *
 * Variáveis: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * Usa a API REST diretamente (sem SDK) para manter o projeto leve.
 */
const API = "https://api.stripe.com/v1";

function key() {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("STRIPE_SECRET_KEY não configurado");
  return k;
}

async function stripe<T>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? new URLSearchParams(params) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Stripe ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

type Session = {
  id: string;
  url: string;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  client_reference_id: string | null;
  metadata?: Record<string, string>;
};

/** Valida o header Stripe-Signature (t=...,v1=...) com tolerância de 5 minutos. */
export function verifyStripeSignature(opts: {
  payload: string;
  header: string | null;
  secret: string;
  toleranceSeconds?: number;
  now?: number;
}) {
  if (!opts.header) return false;
  const items = opts.header.split(",").map((p) => p.split("="));
  const t = items.find(([k]) => k === "t")?.[1];
  const signatures = items.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || signatures.length === 0) return false;
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(t)) > (opts.toleranceSeconds ?? 300)) return false;
  const expected = Buffer.from(
    createHmac("sha256", opts.secret).update(`${t}.${opts.payload}`).digest("hex"),
  );
  return signatures.some((s) => {
    const b = Buffer.from(s);
    return b.length === expected.length && timingSafeEqual(b, expected);
  });
}

function registrationIdOf(session: Session) {
  return session.client_reference_id ?? session.metadata?.registration_id ?? null;
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCheckout({ registration, event }) {
    const back = `${config.siteUrl}/confirmacao/${registration.publicToken}`;
    // Stripe exige expiração entre 30 min e 24 h
    const holdEnd = registration.holdExpiresAt ? Date.parse(registration.holdExpiresAt) : 0;
    const expiresAt = Math.max(holdEnd, Date.now() + 31 * 60 * 1000);
    const session = await stripe<Session>("/checkout/sessions", {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "brl",
      "line_items[0][price_data][unit_amount]": String(registration.amountCents),
      "line_items[0][price_data][product_data][name]": `nós — ${event.title}`,
      customer_email: registration.email,
      client_reference_id: registration.id,
      "metadata[registration_id]": registration.id,
      "metadata[event_id]": event.id,
      success_url: `${back}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.siteUrl}/inscricao/${event.slug}?cancelado=1`,
      expires_at: String(Math.floor(expiresAt / 1000)),
      locale: "pt-BR",
    });
    return { url: session.url, reference: session.id };
  },

  async handleWebhook(request, rawBody) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new WebhookError("STRIPE_WEBHOOK_SECRET não configurado", 500);
    const ok = verifyStripeSignature({
      payload: rawBody,
      header: request.headers.get("stripe-signature"),
      secret,
    });
    if (!ok) throw new WebhookError("assinatura inválida", 401);

    const event = JSON.parse(rawBody) as { type: string; data: { object: Session } };
    const session = event.data.object;
    const registrationId = registrationIdOf(session);
    if (!registrationId) return null;
    const reference = session.id;

    switch (event.type) {
      case "checkout.session.completed":
        return session.payment_status === "paid"
          ? { registrationId, outcome: "paid", reference }
          : { registrationId, outcome: "pending", reference }; // ex.: Pix aguardando
      case "checkout.session.async_payment_succeeded":
        return { registrationId, outcome: "paid", reference };
      case "checkout.session.async_payment_failed":
        return { registrationId, outcome: "failed", reference };
      case "checkout.session.expired":
        return { registrationId, outcome: "cancelled", reference };
      default:
        return null;
    }
  },

  async fetchStatus(registration) {
    if (!registration.providerReference?.startsWith("cs_")) return null;
    const session = await stripe<Session>(`/checkout/sessions/${registration.providerReference}`);
    const update: PaymentUpdate =
      session.payment_status === "paid"
        ? { registrationId: registration.id, outcome: "paid", reference: session.id }
        : { registrationId: registration.id, outcome: "pending", reference: session.id };
    return update;
  },
};
