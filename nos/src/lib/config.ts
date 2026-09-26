/**
 * Configuração lida das variáveis de ambiente.
 * Nenhum segredo fica no código: veja .env.example.
 */
export const config = {
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** mock | mercadopago | stripe */
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? "mock") as "mock" | "mercadopago" | "stripe",
  /** Minutos que uma vaga fica reservada enquanto a pessoa paga. */
  spotHoldMinutes: Number(process.env.SPOT_HOLD_MINUTES ?? 30),
  /** Abaixo (ou igual) deste número de vagas, o status automático vira "últimas vagas". */
  lastSpotsThreshold: Number(process.env.LAST_SPOTS_THRESHOLD ?? 5),
};

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
