import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyStripeSignature } from "../src/lib/payments/stripe";
import { verifyMercadoPagoSignature } from "../src/lib/payments/mercadopago";

describe("assinatura do webhook da Stripe", () => {
  const secret = "whsec_teste";
  const payload = JSON.stringify({ id: "evt_1" });
  const t = 1_800_000_000;
  const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");

  it("aceita assinatura válida", () => {
    expect(verifyStripeSignature({ payload, secret, header: `t=${t},v1=${sig}`, now: t })).toBe(true);
  });
  it("recusa payload alterado, segredo errado ou horário antigo", () => {
    expect(verifyStripeSignature({ payload: payload + " ", secret, header: `t=${t},v1=${sig}`, now: t })).toBe(false);
    expect(verifyStripeSignature({ payload, secret: "outro", header: `t=${t},v1=${sig}`, now: t })).toBe(false);
    expect(verifyStripeSignature({ payload, secret, header: `t=${t},v1=${sig}`, now: t + 3600 })).toBe(false);
    expect(verifyStripeSignature({ payload, secret, header: null, now: t })).toBe(false);
  });
});

describe("assinatura do webhook do Mercado Pago", () => {
  const secret = "segredo";
  const ts = "1704908010";
  const manifest = `id:123456;request-id:req-1;ts:${ts};`;
  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");

  it("aceita assinatura válida", () => {
    expect(verifyMercadoPagoSignature({ secret, signatureHeader: `ts=${ts},v1=${v1}`, requestId: "req-1", dataId: "123456" })).toBe(true);
  });
  it("recusa assinatura inválida", () => {
    expect(verifyMercadoPagoSignature({ secret, signatureHeader: `ts=${ts},v1=${v1}`, requestId: "req-2", dataId: "123456" })).toBe(false);
    expect(verifyMercadoPagoSignature({ secret, signatureHeader: null, requestId: "req-1", dataId: "123456" })).toBe(false);
  });
});

describe("Asaas", async () => {
  const { asaasProvider, asaasCheckoutUrl, minutesToExpire, verifyAsaasToken } = await import("../src/lib/payments/asaas");

  it("confere o token do webhook", () => {
    expect(verifyAsaasToken("abc", "abc")).toBe(true);
    expect(verifyAsaasToken("abc", "abd")).toBe(false);
    expect(verifyAsaasToken("abc", null)).toBe(false);
  });

  it("monta o link do checkout e limita a validade entre 10 e 1440 min", () => {
    expect(asaasCheckoutUrl("x1", true)).toBe("https://sandbox.asaas.com/checkoutSession/show?id=x1");
    expect(asaasCheckoutUrl("x1", false)).toBe("https://asaas.com/checkoutSession/show?id=x1");
    const now = Date.parse("2026-10-21T12:00:00Z");
    expect(minutesToExpire("2026-10-21T12:30:00Z", now)).toBe(30);
    expect(minutesToExpire("2026-10-21T12:01:00Z", now)).toBe(10);
    expect(minutesToExpire("2026-10-25T12:00:00Z", now)).toBe(1440);
  });

  it("traduz o aviso de pagamento e recusa token errado", async () => {
    process.env.ASAAS_WEBHOOK_TOKEN = "segredo-asaas";
    const body = JSON.stringify({ event: "CHECKOUT_PAID", checkout: { id: "chk_1", externalReference: "reg_1" } });
    const req = (token: string) =>
      new Request("https://site/api/webhooks/asaas", { method: "POST", headers: { "asaas-access-token": token }, body });
    await expect(asaasProvider.handleWebhook(req("segredo-asaas"), body)).resolves.toEqual({
      registrationId: "reg_1",
      outcome: "paid",
      reference: "chk_1",
    });
    await expect(asaasProvider.handleWebhook(req("outro"), body)).rejects.toThrow("token inválido");
    const ignorado = JSON.stringify({ event: "CHECKOUT_CREATED", checkout: { id: "chk_1" } });
    await expect(asaasProvider.handleWebhook(req("segredo-asaas"), ignorado)).resolves.toBeNull();
  });
});
