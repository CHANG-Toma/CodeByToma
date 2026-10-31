/**
 * Agrégats financiers pour le dashboard et l’API assistant (sans PII sensible).
 */

export type PendingQuoteSummary = {
  id: string;
  number: string;
  clientLabel: string;
  totalCents: number;
  sentAt: string | null;
  ageDays: number;
};

export type UnpaidInvoiceSummary = {
  id: string;
  number: string;
  clientLabel: string;
  remainingCents: number;
  dueAt: string | null;
  status: string;
  daysLate: number | null;
};

export type ActiveSubscriptionSummary = {
  id: string;
  clientLabel: string;
  label: string;
  priceCents: number;
  nextBillingDate: string | null;
};

export type FinanceSnapshot = {
  period: { month: number; year: number };
  collectedCents: number;
  invoicedCents: number;
  pendingQuotes: PendingQuoteSummary[];
  unpaidInvoices: UnpaidInvoiceSummary[];
  activeSubscriptions: ActiveSubscriptionSummary[];
  monthlyRecurringCents: number;
  expectedRevenueCents: number;
  monthlyRevenueGoalCents: number | null;
};

/** CA prévu = devis en attente + MRR des abonnements actifs. */
export function computeExpectedRevenueCents(input: {
  pendingQuotesTotalCents: number;
  monthlyRecurringCents: number;
}): number {
  return input.pendingQuotesTotalCents + input.monthlyRecurringCents;
}

export function quoteAgeDays(
  anchor: Date | null,
  createdAt: Date,
  now: Date,
): number {
  const base = anchor ?? createdAt;
  const ms = now.getTime() - base.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function invoiceDaysLate(dueAt: Date | null, now: Date): number | null {
  if (!dueAt) return null;
  const ms = now.getTime() - dueAt.getTime();
  if (ms <= 0) return null;
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
