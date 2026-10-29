export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "paused",
  "cancelled",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ["sent", "rejected"],
  sent: ["accepted", "rejected", "expired", "draft"],
  accepted: [],
  rejected: ["draft"],
  expired: ["draft"],
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ["issued", "cancelled"],
  issued: ["partially_paid", "paid", "overdue", "cancelled"],
  partially_paid: ["paid", "overdue", "cancelled"],
  paid: [],
  overdue: ["partially_paid", "paid", "cancelled"],
  cancelled: [],
};

const SUBSCRIPTION_TRANSITIONS: Record<
  SubscriptionStatus,
  readonly SubscriptionStatus[]
> = {
  active: ["paused", "cancelled"],
  paused: ["active", "cancelled"],
  cancelled: [],
};

export function canTransitionQuote(
  from: QuoteStatus,
  to: QuoteStatus,
): boolean {
  if (from === to) return true;
  return QUOTE_TRANSITIONS[from].includes(to);
}

export function assertQuoteTransition(
  from: QuoteStatus,
  to: QuoteStatus,
): void {
  if (!canTransitionQuote(from, to)) {
    throw new Error(`Transition devis interdite : ${from} → ${to}`);
  }
}

export function canTransitionInvoice(
  from: InvoiceStatus,
  to: InvoiceStatus,
): boolean {
  if (from === to) return true;
  return INVOICE_TRANSITIONS[from].includes(to);
}

export function assertInvoiceTransition(
  from: InvoiceStatus,
  to: InvoiceStatus,
): void {
  if (!canTransitionInvoice(from, to)) {
    throw new Error(`Transition facture interdite : ${from} → ${to}`);
  }
}

export function canTransitionSubscription(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): boolean {
  if (from === to) return true;
  return SUBSCRIPTION_TRANSITIONS[from].includes(to);
}

export function assertSubscriptionTransition(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): void {
  if (!canTransitionSubscription(from, to)) {
    throw new Error(`Transition abonnement interdite : ${from} → ${to}`);
  }
}

/**
 * Déduit le statut facture après un paiement (totaux en centimes).
 */
export function invoiceStatusAfterPayment(
  current: InvoiceStatus,
  totalCents: number,
  paidCents: number,
): InvoiceStatus {
  if (current === "cancelled" || current === "draft") {
    throw new Error("Impossible d'enregistrer un paiement sur cette facture");
  }
  if (paidCents <= 0) return current;
  if (paidCents >= totalCents) return "paid";
  return "partially_paid";
}
