import type {
  InvoiceStatus,
  QuoteStatus,
} from "@/server/domain/status-transitions";

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré",
};

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  issued: "Émise",
  partially_paid: "Partiellement payée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export const paymentMethodLabel: Record<string, string> = {
  bank_transfer: "Virement",
  card: "Carte",
  cash: "Espèces",
  check: "Chèque",
  other: "Autre",
};
