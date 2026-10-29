/**
 * Port OCP : le MVP utilise un enregistrement manuel.
 * Stripe (ou autre) pourra implémenter cette interface plus tard.
 */
export type PaymentIntentInput = {
  invoiceId: string;
  amountCents: number;
  currency: string;
  description?: string;
};

export type PaymentIntentResult = {
  externalId: string;
  status: "pending" | "completed" | "failed";
  checkoutUrl?: string;
};

export interface IPaymentGateway {
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  readonly provider: string;
}
