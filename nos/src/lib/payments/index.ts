import { config } from "../config";
import { mercadoPagoProvider } from "./mercadopago";
import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

/**
 * Para trocar de provedor basta mudar PAYMENT_PROVIDER no .env.
 * Para adicionar outro (ex.: Asaas, Pagar.me), crie um arquivo que implemente
 * PaymentProvider (types.ts) e registre aqui.
 */
const providers: Record<string, PaymentProvider> = {
  mock: mockProvider,
  mercadopago: mercadoPagoProvider,
  stripe: stripeProvider,
};

export function getPaymentProvider(id: string = config.paymentProvider): PaymentProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Provedor de pagamento desconhecido: ${id}`);
  return provider;
}

export function isTestMode() {
  return config.paymentProvider === "mock";
}

export type { PaymentProvider, PaymentUpdate, CheckoutResult } from "./types";
export { WebhookError } from "./types";
