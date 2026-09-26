import { config } from "../config";
import type { PaymentProvider } from "./types";

/**
 * Provedor de TESTE: nenhum dinheiro é cobrado.
 * Envia a pessoa para /checkout/teste/[token], uma página que simula o checkout
 * com botões "aprovar" e "recusar". Use enquanto o provedor real não estiver configurado.
 */
export const mockProvider: PaymentProvider = {
  id: "mock",
  async createCheckout({ registration }) {
    return {
      url: `/checkout/teste/${registration.publicToken}`,
      reference: `mock_${registration.id}`,
    };
  },
  async handleWebhook() {
    // O modo teste confirma direto pela página /checkout/teste (server action).
    return null;
  },
};
