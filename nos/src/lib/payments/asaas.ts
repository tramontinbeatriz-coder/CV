import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { db } from "../db";
import { registrations } from "../db/schema";
import type { PaymentProvider, PaymentUpdate } from "./types";
import { WebhookError } from "./types";

/**
 * Asaas — Checkout (Pix + cartão).
 * Docs: https://docs.asaas.com/docs/checkout-asaas
 *
 * Variáveis: ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN, ASAAS_SANDBOX (true = conta de teste)
 * Segurança: o aviso só é aceito se o header `asaas-access-token` for igual ao
 * ASAAS_WEBHOOK_TOKEN que você cadastrou no webhook dentro do Asaas.
 */
function sandbox() {
  return process.env.ASAAS_SANDBOX === "true";
}

function apiBase() {
  return sandbox() ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
}

export function asaasCheckoutUrl(id: string, useSandbox = sandbox()) {
  const host = useSandbox ? "https://sandbox.asaas.com" : "https://asaas.com";
  return `${host}/checkoutSession/show?id=${encodeURIComponent(id)}`;
}

function apiKey() {
  const k = process.env.ASAAS_API_KEY;
  if (!k) throw new Error("ASAAS_API_KEY não configurada");
  return k;
}

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      access_token: apiKey(),
      "Content-Type": "application/json",
      "User-Agent": "nos-site",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Asaas ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Compara o token recebido com o configurado sem vazar tempo de comparação. */
export function verifyAsaasToken(expected: string, received: string | null) {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Minutos até a reserva da vaga expirar, dentro do limite do Asaas (10 a 1440). */
export function minutesToExpire(holdExpiresAt: string | null | undefined, now = Date.now()) {
  const fallback = config.spotHoldMinutes || 30;
  const mins = holdExpiresAt ? Math.floor((Date.parse(holdExpiresAt) - now) / 60_000) : fallback;
  return Math.min(1440, Math.max(10, Number.isFinite(mins) ? mins : fallback));
}

type AsaasCheckoutEvent = {
  id?: string;
  event?: string;
  checkout?: { id?: string; externalReference?: string | null };
};

const OUTCOMES: Record<string, PaymentUpdate["outcome"]> = {
  CHECKOUT_PAID: "paid",
  CHECKOUT_CANCELED: "cancelled",
  CHECKOUT_EXPIRED: "cancelled",
};

export const asaasProvider: PaymentProvider = {
  id: "asaas",

  async createCheckout({ registration, event }) {
    const base = config.siteUrl;
    const back = `${base}/confirmacao/${registration.publicToken}`;
    const { id } = await asaas<{ id: string }>("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        billingTypes: ["PIX", "CREDIT_CARD"],
        chargeTypes: ["DETACHED"],
        minutesToExpire: minutesToExpire(registration.holdExpiresAt),
        externalReference: registration.id,
        callback: {
          successUrl: back,
          cancelUrl: `${back}?falhou=1`,
          expiredUrl: `${back}?falhou=1`,
        },
        items: [
          {
            name: `nós — ${event.title}`.slice(0, 100),
            description: `inscrição de ${registration.name}`.slice(0, 150),
            quantity: 1,
            value: registration.amountCents / 100,
          },
        ],
      }),
    });
    return { url: asaasCheckoutUrl(id), reference: id };
  },

  async handleWebhook(request, rawBody) {
    const expected = process.env.ASAAS_WEBHOOK_TOKEN;
    if (!expected) throw new WebhookError("ASAAS_WEBHOOK_TOKEN não configurado", 500);
    if (!verifyAsaasToken(expected, request.headers.get("asaas-access-token"))) {
      throw new WebhookError("token inválido", 401);
    }

    let body: AsaasCheckoutEvent;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      throw new WebhookError("JSON inválido");
    }
    const outcome = body.event ? OUTCOMES[body.event] : undefined;
    const checkoutId = body.checkout?.id;
    if (!outcome || !checkoutId) return null;

    // O aviso pode não trazer o externalReference: nesse caso acha a inscrição pelo id do checkout.
    let registrationId = body.checkout?.externalReference ?? undefined;
    if (!registrationId) {
      const [reg] = await db
        .select({ id: registrations.id })
        .from(registrations)
        .where(eq(registrations.providerReference, checkoutId))
        .limit(1);
      registrationId = reg?.id;
    }
    if (!registrationId) return null;
    return { registrationId, outcome, reference: checkoutId } as PaymentUpdate;
  },
};
