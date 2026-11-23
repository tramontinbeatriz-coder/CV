import { describe, expect, it } from "vitest";
import { couponProblem, describeCoupon, discountFor, normalizeCouponCode } from "../src/lib/coupon-rules";
import type { Coupon } from "../src/lib/db/schema";

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: "c1",
  code: "NOS10",
  kind: "percent",
  value: 10,
  eventId: null,
  maxUses: null,
  expiresOn: null,
  active: true,
  createdAt: "2026-11-01T00:00:00Z",
  ...over,
});
const event = { id: "e1", priceCents: 9000 };

describe("cupons", () => {
  it("normaliza o código", () => {
    expect(normalizeCouponCode("  nos 10 ")).toBe("NOS10");
  });

  it("calcula desconto em porcentagem e valor fixo, sem passar do preço", () => {
    expect(discountFor(9000, { kind: "percent", value: 10 })).toBe(900);
    expect(discountFor(6500, { kind: "percent", value: 15 })).toBe(975);
    expect(discountFor(9000, { kind: "percent", value: 100 })).toBe(9000);
    expect(discountFor(9000, { kind: "fixed", value: 2000 })).toBe(2000);
    expect(discountFor(1500, { kind: "fixed", value: 2000 })).toBe(1500);
    expect(discountFor(0, { kind: "fixed", value: 2000 })).toBe(0);
  });

  it("descreve o desconto", () => {
    expect(describeCoupon({ kind: "percent", value: 10 })).toBe("10% off");
    expect(describeCoupon({ kind: "fixed", value: 2000 }).replace(/\s/g, " ")).toBe("R$ 20,00 off");
  });

  it("recusa cupom inexistente, desativado, expirado, de outro encontro ou em encontro gratuito", () => {
    expect(couponProblem(undefined, event)).toMatch(/não existe/);
    expect(couponProblem(coupon({ active: false }), event)).toMatch(/não existe/);
    expect(couponProblem(coupon({ expiresOn: "2026-11-22" }), event, "2026-11-23")).toMatch(/expirou/);
    expect(couponProblem(coupon({ eventId: "outro" }), event)).toMatch(/não vale/);
    expect(couponProblem(coupon(), { id: "e1", priceCents: 0 })).toMatch(/gratuito/);
  });

  it("aceita cupom válido (inclusive no último dia da validade)", () => {
    expect(couponProblem(coupon(), event)).toBeNull();
    expect(couponProblem(coupon({ expiresOn: "2026-11-23", eventId: "e1" }), event, "2026-11-23")).toBeNull();
  });
});
