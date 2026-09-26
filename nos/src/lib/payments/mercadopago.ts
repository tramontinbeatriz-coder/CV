import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config";
import type { PaymentProvider, PaymentUpdate } from "./types";
import { WebhookError } from "./types";

/**
 * Mercado Pago — Checkout Pro (Pix, cartão, boleto).
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro
 *
 * Variáveis: MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET (opcional, recomendado)
 * Segurança: mesmo com a assinatura, o status é SEMPRE reconsultado na API do Mercado Pago
 * com o nosso token antes de confirmar uma inscrição.
 */
const API = "https://api.mercadopago.com";

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return t;
}

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mercado Pago ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

type MpPayment = { id: number; status: string; external_reference?: string };

function toUpdate(payment: MpPayment): PaymentUpdate | null {
  const registrationId = payment.external_reference;
  if (!registrationId) return null;
  const reference = String(payment.id);
  switch (payment.status) {
    case "approved":
      return { registrationId, outcome: "paid", reference };
    case "rejected":
      return { registrationId, outcome: "failed", reference };
    case "cancelled":
      return { registrationId, outcome: "cancelled", reference };
    case "refunded":
    case "charged_back":
      return { registrationId, outcome: "refunded", reference };
    default:
      return { registrationId, outcome: "pending", reference };
  }
}

/** Valida o header x-signature (manifest: id:{data.id};request-id:{x-request-id};ts:{ts};) */
export function verifyMercadoPagoSignature(opts: {
  secret: string;
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
}) {
  if (!opts.signatureHeader) return false;
  const pairs = Object.fromEntries(
    opts.signatureHeader.split(",").map((p) => p.trim().split("=") as [string, string]),
  );
  if (!pairs.ts || !pairs.v1) return false;
  const id = /^[a-z0-9]+$/i.test(opts.dataId) ? opts.dataId.toLowerCase() : opts.dataId;
  let manifest = `id:${id};`;
  if (opts.requestId) manifest += `request-id:${opts.requestId};`;
  manifest += `ts:${pairs.ts};`;
  const expected = createHmac("sha256", opts.secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(pairs.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const mercadoPagoProvider: PaymentProvider = {
  id: "mercadopago",

  async createCheckout({ registration, event }) {
    const base = config.siteUrl;
    const back = `${base}/confirmacao/${registration.publicToken}`;
    const pref = await mp<{ id: string; init_point: string; sandbox_init_point: string }>(
      "/checkout/preferences",
      {
        method: "POST",
        headers: { "X-Idempotency-Key": registration.id },
        body: JSON.stringify({
          items: [
            {
              id: event.id,
              title: `nós — ${event.title}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: registration.amountCents / 100,
            },
          ],
          payer: { name: registration.name, email: registration.email },
          external_reference: registration.id,
          back_urls: { success: back, pending: back, failure: `${back}?falhou=1` },
          auto_return: "approved",
          notification_url: `${base}/api/webhooks/mercadopago`,
          statement_descriptor: "NOS",
          expires: true,
          expiration_date_to: registration.holdExpiresAt ?? undefined,
        }),
      },
    );
    const useSandbox = process.env.MERCADOPAGO_USE_SANDBOX === "true";
    return { url: useSandbox ? pref.sandbox_init_point : pref.init_point, reference: pref.id };
  },

  async handleWebhook(request, rawBody) {
    const url = new URL(request.url);
    let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      throw new WebhookError("JSON inválido");
    }
    const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "");
    if (type !== "payment" || !dataId) return null;

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (secret) {
      const ok = verifyMercadoPagoSignature({
        secret,
        signatureHeader: request.headers.get("x-signature"),
        requestId: request.headers.get("x-request-id"),
        dataId,
      });
      if (!ok) throw new WebhookError("assinatura inválida", 401);
    }

    const payment = await mp<MpPayment>(`/v1/payments/${encodeURIComponent(dataId)}`);
    return toUpdate(payment);
  },

  async fetchStatus(registration) {
    const search = await mp<{ results: MpPayment[] }>(
      `/v1/payments/search?external_reference=${encodeURIComponent(registration.id)}&sort=date_created&criteria=desc`,
    );
    const approved = search.results.find((p) => p.status === "approved");
    const chosen = approved ?? search.results[0];
    return chosen ? toUpdate(chosen) : null;
  },
};
