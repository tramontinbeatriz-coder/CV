import { and, count, desc, eq, gt, ne, or, sql } from "drizzle-orm";
import { db } from "./db";
import { coupons, registrations, type Coupon, type Event } from "./db/schema";
import { couponProblem, discountFor, normalizeCouponCode } from "./coupon-rules";

export { couponProblem, describeCoupon, discountFor, normalizeCouponCode } from "./coupon-rules";

type Db = Pick<typeof db, "select">;

/**
 * Usos de um cupom: inscrições pagas + reservas ainda válidas (para o limite não estourar
 * enquanto alguém está pagando). `exceptRegistrationId` ignora a reserva da própria pessoa.
 */
export async function couponUses(couponId: string, tx: Db = db, exceptRegistrationId?: string) {
  const now = new Date().toISOString();
  const [row] = await tx
    .select({ n: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.couponId, couponId),
        or(
          eq(registrations.paymentStatus, "paid"),
          and(eq(registrations.paymentStatus, "pending"), gt(registrations.holdExpiresAt, now)),
        ),
        exceptRegistrationId ? ne(registrations.id, exceptRegistrationId) : undefined,
      ),
    );
  return row?.n ?? 0;
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discountCents: number; finalCents: number }
  | { ok: false; error: string };

/** Valida o cupom para um encontro e calcula o valor final. Sempre no servidor. */
export async function checkCoupon(
  rawCode: string,
  event: Pick<Event, "id" | "priceCents">,
  tx: Db = db,
  exceptRegistrationId?: string,
): Promise<CouponCheck> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return { ok: false, error: "digite o código do cupom" };
  const [coupon] = await tx.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  const problem = couponProblem(coupon, event);
  if (problem) return { ok: false, error: problem };
  if (coupon.maxUses != null && (await couponUses(coupon.id, tx, exceptRegistrationId)) >= coupon.maxUses) {
    return { ok: false, error: "esse cupom já foi usado o máximo de vezes" };
  }
  const discountCents = discountFor(event.priceCents, coupon);
  return { ok: true, coupon, discountCents, finalCents: event.priceCents - discountCents };
}

/** Lista para o painel, com quantas inscrições pagas usaram cada cupom. */
export async function listCouponsWithUses() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  const used = await db
    .select({ id: registrations.couponId, n: count() })
    .from(registrations)
    .where(and(sql`${registrations.couponId} is not null`, eq(registrations.paymentStatus, "paid")))
    .groupBy(registrations.couponId);
  const byId = new Map(used.map((u) => [u.id, u.n]));
  return rows.map((c) => ({ ...c, paidUses: byId.get(c.id) ?? 0 }));
}
