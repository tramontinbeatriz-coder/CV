/**
 * Configuração lida das variáveis de ambiente.
 * Nenhum segredo fica no código: veja .env.example.
 */
export const config = {
  siteUrl: siteUrl(),
  /** mock | mercadopago | stripe | asaas */
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? "mock") as "mock" | "mercadopago" | "stripe" | "asaas",
  /** Minutos que uma vaga fica reservada enquanto a pessoa paga. */
  spotHoldMinutes: Number(process.env.SPOT_HOLD_MINUTES ?? 30),
  /** Abaixo (ou igual) deste número de vagas, o status automático vira "últimas vagas". */
  lastSpotsThreshold: Number(process.env.LAST_SPOTS_THRESHOLD ?? 5),
};

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** SITE_URL, ou o endereço que a Vercel dá ao projeto quando SITE_URL não foi definida. */
function siteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = process.env.SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}
