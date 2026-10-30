/**
 * Règles pures pour la file « À faire aujourd'hui ».
 * Aucun LLM — priorités métier facturation / suivi.
 */

export const QUOTE_FOLLOW_UP_AFTER_DAYS = 7;
export const QUOTE_EXPIRING_WITHIN_DAYS = 7;
export const SUBSCRIPTION_DUE_WITHIN_DAYS = 7;

export const TODAY_ACTION_KINDS = [
  "invoice_overdue",
  "quote_expired",
  "quote_follow_up",
  "quote_expiring",
  "subscription_due",
  "accepted_quote_without_invoice",
] as const;

export type TodayActionKind = (typeof TODAY_ACTION_KINDS)[number];

export type TodayActionPriority = 1 | 2 | 3 | 4 | 5 | 6;

/** Plus petit = plus urgent. */
export const TODAY_ACTION_PRIORITY: Record<TodayActionKind, TodayActionPriority> =
  {
    invoice_overdue: 1,
    quote_expired: 2,
    subscription_due: 3,
    quote_follow_up: 4,
    quote_expiring: 5,
    accepted_quote_without_invoice: 6,
  };

export const TODAY_ACTION_LABEL: Record<TodayActionKind, string> = {
  invoice_overdue: "Facture en retard",
  quote_expired: "Devis expiré",
  quote_follow_up: "Devis à relancer",
  quote_expiring: "Devis bientôt expiré",
  subscription_due: "Échéance abonnement",
  accepted_quote_without_invoice: "Devis accepté sans facture",
};

export type TodayAction = {
  id: string;
  kind: TodayActionKind;
  priority: TodayActionPriority;
  title: string;
  detail: string;
  href: string;
  /** Lien vers le brouillon de relance, si applicable. */
  remindHref?: string;
  dueAt: Date | null;
  amountCents: number | null;
  clientId: string | null;
  clientLabel: string | null;
};

export function isRemindableKind(kind: TodayActionKind): boolean {
  return (
    kind === "invoice_overdue" ||
    kind === "quote_follow_up" ||
    kind === "quote_expired" ||
    kind === "quote_expiring"
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function isInvoiceOverdue(input: {
  status: string;
  dueAt: Date | null;
  now: Date;
}): boolean {
  if (input.status === "overdue") return true;
  if (
    (input.status === "issued" || input.status === "partially_paid") &&
    input.dueAt &&
    input.dueAt < input.now
  ) {
    return true;
  }
  return false;
}

export function isQuoteExpired(input: {
  status: string;
  validUntil: Date | null;
  now: Date;
}): boolean {
  if (input.status !== "sent") return false;
  return Boolean(input.validUntil && input.validUntil < input.now);
}

export function isQuoteFollowUpDue(input: {
  status: string;
  sentAt: Date | null;
  createdAt: Date;
  validUntil: Date | null;
  now: Date;
  afterDays?: number;
}): boolean {
  if (input.status !== "sent") return false;
  // Expiré = autre action dédiée
  if (isQuoteExpired({ status: input.status, validUntil: input.validUntil, now: input.now })) {
    return false;
  }
  const afterDays = input.afterDays ?? QUOTE_FOLLOW_UP_AFTER_DAYS;
  const anchor = input.sentAt ?? input.createdAt;
  return daysBetween(anchor, input.now) >= afterDays;
}

export function isQuoteExpiringSoon(input: {
  status: string;
  validUntil: Date | null;
  now: Date;
  withinDays?: number;
}): boolean {
  if (input.status !== "sent" || !input.validUntil) return false;
  if (input.validUntil < input.now) return false;
  const within = input.withinDays ?? QUOTE_EXPIRING_WITHIN_DAYS;
  return input.validUntil <= addDays(startOfDay(input.now), within);
}

export function isSubscriptionDueSoon(input: {
  status: string;
  nextBillingDate: Date | null;
  now: Date;
  withinDays?: number;
}): boolean {
  if (input.status !== "active" || !input.nextBillingDate) return false;
  const within = input.withinDays ?? SUBSCRIPTION_DUE_WITHIN_DAYS;
  return input.nextBillingDate <= addDays(startOfDay(input.now), within);
}

export function sortTodayActions(actions: TodayAction[]): TodayAction[] {
  return [...actions].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const aDue = a.dueAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const bDue = b.dueAt?.getTime() ?? Number.POSITIVE_INFINITY;
    if (aDue !== bDue) return aDue - bDue;
    return a.title.localeCompare(b.title, "fr");
  });
}
