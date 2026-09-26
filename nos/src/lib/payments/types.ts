import type { Event, Registration } from "../db/schema";

export type CheckoutResult = {
  /** Para onde a pessoa é enviada para pagar (checkout seguro do provedor). */
  url: string;
  /** Id da sessão/preferência no provedor (guardado na inscrição). */
  reference: string;
};

/** Resultado normalizado de um aviso (webhook) ou consulta ao provedor. */
export type PaymentUpdate =
  | { registrationId: string; outcome: "paid"; reference?: string }
  | { registrationId: string; outcome: "failed" | "cancelled" | "refunded"; reference?: string }
  | { registrationId: string; outcome: "pending"; reference?: string };

export interface PaymentProvider {
  readonly id: string;
  /** Cria a sessão de checkout. Dados de cartão NUNCA passam pelo nosso servidor. */
  createCheckout(input: { registration: Registration; event: Event }): Promise<CheckoutResult>;
  /** Valida a assinatura do webhook e traduz o aviso. `null` = aviso ignorável. */
  handleWebhook(request: Request, rawBody: string): Promise<PaymentUpdate | null>;
  /** Consulta o status direto no provedor (usado na volta do checkout). */
  fetchStatus?(registration: Registration): Promise<PaymentUpdate | null>;
}

export class WebhookError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}
