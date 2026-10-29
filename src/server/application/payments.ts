import { NotFoundError, ValidationError } from "@/server/domain/errors";
import type { PaymentRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { applyPaymentToInvoice } from "./invoices";
import { paymentCreateSchema } from "./schemas";

export async function listPayments(invoiceId?: string): Promise<PaymentRecord[]> {
  return deps.payments.list(invoiceId ? { invoiceId } : undefined);
}

export async function createPayment(input: unknown): Promise<PaymentRecord> {
  const parsed = paymentCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const invoice = await deps.invoices.findById(parsed.data.invoiceId);
  if (!invoice) throw new NotFoundError("Facture", parsed.data.invoiceId);

  // OCP: gateway manuel disponible pour extension Stripe
  await deps.paymentGateway.createPaymentIntent({
    invoiceId: invoice.id,
    amountCents: parsed.data.amountCents,
    currency: invoice.currency,
  });

  const payment = await deps.payments.create({
    invoiceId: parsed.data.invoiceId,
    amountCents: parsed.data.amountCents,
    currency: invoice.currency,
    method: parsed.data.method,
    status: "completed",
    paidAt: parsed.data.paidAt,
    reference: parsed.data.reference ?? null,
    notes: parsed.data.notes ?? null,
  });

  await applyPaymentToInvoice(invoice.id);

  await deps.audit.append({
    action: "payment.recorded",
    entity: "Payment",
    entityId: payment.id,
    metadata: { invoiceId: invoice.id, amountCents: payment.amountCents },
  });

  return payment;
}
