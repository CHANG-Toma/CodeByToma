import type {
  IPaymentGateway,
  PaymentIntentInput,
  PaymentIntentResult,
} from "@/server/domain/ports/payment-gateway";

/** Enregistrement manuel — pas de PSP au MVP. */
export class ManualPaymentGateway implements IPaymentGateway {
  readonly provider = "manual";

  async createPaymentIntent(
    input: PaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    return {
      externalId: `manual_${input.invoiceId}_${Date.now()}`,
      status: "pending",
    };
  }
}
