import type { Coupon, Event } from "./db/schema";
import { formatPrice, todayISO } from "./format";

/** Regras puras dos cupons (sem banco), usadas no servidor e nos testes. */

/** "  nos10 " → "NOS10" */
export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/** Desconto em centavos, nunca maior que o preço. */
export function discountFor(priceCents: number, coupon: Pick<Coupon, "kind" | "value">) {
  if (priceCents <= 0) return 0;
  const raw = coupon.kind === "percent" ? Math.round((priceCents * coupon.value) / 100) : coupon.value;
  return Math.max(0, Math.min(priceCents, raw));
}

/** "10% off" / "R$ 20,00 off" */
export function describeCoupon(coupon: Pick<Coupon, "kind" | "value">) {
  return coupon.kind === "percent" ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`;
}

/**
 * Motivo pelo qual o cupom não vale (ou null se vale), sem contar os usos.
 * Separado para poder testar sem banco.
 */
export function couponProblem(coupon: Coupon | undefined, event: Pick<Event, "id" | "priceCents">, today = todayISO()) {
  if (!coupon || !coupon.active) return "esse cupom não existe ou não está mais ativo";
  if (coupon.expiresOn && coupon.expiresOn < today) return "esse cupom já expirou";
  if (coupon.eventId && coupon.eventId !== event.id) return "esse cupom não vale para esse encontro";
  if (event.priceCents <= 0) return "esse encontro já é gratuito 🤍";
  return null;
}
