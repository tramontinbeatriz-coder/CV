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
