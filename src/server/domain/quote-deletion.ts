import type { InvoiceStatus } from "./status-transitions";

export type QuoteLinkedInvoice = {
  id: string;
  status: InvoiceStatus;
  paymentCount: number;
};

const BLOCKING_INVOICE_STATUSES: InvoiceStatus[] = [
  "issued",
  "partially_paid",
  "paid",
  "overdue",
];

export type QuoteDeletionPlan =
  | { allowed: true; invoiceIdsToRemove: string[] }
  | { allowed: false; message: string };

/** Règles métier avant suppression d’un devis (sans accès DB). */
export function planQuoteDeletion(
  invoices: QuoteLinkedInvoice[],
): QuoteDeletionPlan {
  for (const invoice of invoices) {
    if (invoice.paymentCount > 0) {
      return {
        allowed: false,
        message:
          "Ce devis est lié à une facture avec au moins un paiement. Supprimez ou annulez d’abord le paiement, ou contactez la comptabilité.",
      };
    }
    if (BLOCKING_INVOICE_STATUSES.includes(invoice.status)) {
      return {
        allowed: false,
        message:
          "Ce devis est lié à une facture émise ou encaissée. Vous ne pouvez pas le supprimer.",
      };
    }
  }

  return {
    allowed: true,
    invoiceIdsToRemove: invoices.map((i) => i.id),
  };
}
