import { getPaymentProvider, WebhookError } from "@/lib/payments";
import { applyPaymentUpdate } from "@/lib/registrations";

/**
 * Avisos (webhooks) dos provedores de pagamento:
 *   /api/webhooks/mercadopago
 *   /api/webhooks/stripe
 * A assinatura é validada dentro de cada provedor antes de qualquer alteração.
 */
export async function POST(request: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await ctx.params;
  let provider;
  try {
    provider = getPaymentProvider(id);
  } catch {
    return Response.json({ error: "provedor desconhecido" }, { status: 404 });
  }
  const raw = await request.text();
  try {
    const update = await provider.handleWebhook(request, raw);
    if (update) await applyPaymentUpdate(update, provider.id, safeJson(raw));
    return Response.json({ received: true });
  } catch (err) {
    if (err instanceof WebhookError) return Response.json({ error: err.message }, { status: err.status });
    console.error("[webhook]", id, err);
    // 500 → o provedor tenta de novo mais tarde
    return Response.json({ error: "erro interno" }, { status: 500 });
  }
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
