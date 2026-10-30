import { dashboardHref } from "@/lib/dashboard-href";
import {
  isInvoiceOverdue,
  isQuoteExpired,
  isQuoteExpiringSoon,
  isQuoteFollowUpDue,
  isSubscriptionDueSoon,
  sortTodayActions,
  TODAY_ACTION_LABEL,
  TODAY_ACTION_PRIORITY,
  type TodayAction,
} from "@/server/domain/today-actions";
import { getDashboardBasePath } from "@/server/infrastructure/auth/dashboard-path";
import { deps } from "./container";

function clientLabel(
  clients: Map<string, { name: string; companyName: string | null }>,
  clientId: string,
): string {
  const c = clients.get(clientId);
  if (!c) return "Client";
  return c.companyName || c.name;
}

function formatDaysLate(dueAt: Date, now: Date): string {
  const days = Math.max(
    0,
    Math.floor(
      (now.getTime() - dueAt.getTime()) / (24 * 60 * 60 * 1000),
    ),
  );
  if (days === 0) return "échéance aujourd’hui";
  if (days === 1) return "1 jour de retard";
  return `${days} jours de retard`;
}

/**
 * Agrège les actions opérationnelles du jour (règles métier, pas d’IA).
 */
export async function listTodayActions(now = new Date()): Promise<TodayAction[]> {
  const slug = getDashboardBasePath();
  const [
    overdueInvoices,
    issuedInvoices,
    partialInvoices,
    sentQuotes,
    acceptedQuotes,
    invoices,
    subscriptions,
    clients,
  ] = await Promise.all([
    deps.invoices.list({ status: "overdue" }),
    deps.invoices.list({ status: "issued" }),
    deps.invoices.list({ status: "partially_paid" }),
    deps.quotes.list({ status: "sent" }),
    deps.quotes.list({ status: "accepted" }),
    deps.invoices.list(),
    deps.subscriptions.list({ status: "active" }),
    deps.clients.list(),
  ]);

  const clientMap = new Map(
    clients.map((c) => [c.id, { name: c.name, companyName: c.companyName }]),
  );
  const invoiceQuoteIds = new Set(
    invoices.map((i) => i.quoteId).filter((id): id is string => Boolean(id)),
  );

  const actions: TodayAction[] = [];
  const seen = new Set<string>();

  function push(action: TodayAction) {
    if (seen.has(action.id)) return;
    seen.add(action.id);
    actions.push(action);
  }

  const lateInvoices = [
    ...overdueInvoices,
    ...issuedInvoices,
    ...partialInvoices,
  ].filter((inv) =>
    isInvoiceOverdue({ status: inv.status, dueAt: inv.dueAt, now }),
  );

  for (const inv of lateInvoices) {
    const remaining = Math.max(0, inv.totalCents - inv.paidCents);
    push({
      id: `invoice_overdue:${inv.id}`,
      kind: "invoice_overdue",
      priority: TODAY_ACTION_PRIORITY.invoice_overdue,
      title: `${TODAY_ACTION_LABEL.invoice_overdue} · ${inv.number}`,
      detail: inv.dueAt
        ? formatDaysLate(inv.dueAt, now)
        : "Échéance dépassée",
      href: dashboardHref(slug, `invoices/${inv.id}`),
      dueAt: inv.dueAt,
      amountCents: remaining,
      clientId: inv.clientId,
      clientLabel: clientLabel(clientMap, inv.clientId),
    });
  }

  for (const quote of sentQuotes) {
    const label = clientLabel(clientMap, quote.clientId);

    if (
      isQuoteExpired({
        status: quote.status,
        validUntil: quote.validUntil,
        now,
      })
    ) {
      push({
        id: `quote_expired:${quote.id}`,
        kind: "quote_expired",
        priority: TODAY_ACTION_PRIORITY.quote_expired,
        title: `${TODAY_ACTION_LABEL.quote_expired} · ${quote.number}`,
        detail: quote.validUntil
          ? `Validité au ${quote.validUntil.toLocaleDateString("fr-FR")}`
          : "Validité dépassée",
        href: dashboardHref(slug, `quotes/${quote.id}`),
        dueAt: quote.validUntil,
        amountCents: quote.totalCents,
        clientId: quote.clientId,
        clientLabel: label,
      });
      continue;
    }

    if (
      isQuoteFollowUpDue({
        status: quote.status,
        sentAt: quote.sentAt,
        createdAt: quote.createdAt,
        validUntil: quote.validUntil,
        now,
      })
    ) {
      const anchor = quote.sentAt ?? quote.createdAt;
      const days = Math.floor(
        (now.getTime() - anchor.getTime()) / (24 * 60 * 60 * 1000),
      );
      push({
        id: `quote_follow_up:${quote.id}`,
        kind: "quote_follow_up",
        priority: TODAY_ACTION_PRIORITY.quote_follow_up,
        title: `${TODAY_ACTION_LABEL.quote_follow_up} · ${quote.number}`,
        detail: `Envoyé il y a ${days} jour${days > 1 ? "s" : ""}`,
        href: dashboardHref(slug, `quotes/${quote.id}`),
        dueAt: anchor,
        amountCents: quote.totalCents,
        clientId: quote.clientId,
        clientLabel: label,
      });
      continue;
    }

    if (
      isQuoteExpiringSoon({
        status: quote.status,
        validUntil: quote.validUntil,
        now,
      })
    ) {
      push({
        id: `quote_expiring:${quote.id}`,
        kind: "quote_expiring",
        priority: TODAY_ACTION_PRIORITY.quote_expiring,
        title: `${TODAY_ACTION_LABEL.quote_expiring} · ${quote.number}`,
        detail: quote.validUntil
          ? `Expire le ${quote.validUntil.toLocaleDateString("fr-FR")}`
          : "Expiration proche",
        href: dashboardHref(slug, `quotes/${quote.id}`),
        dueAt: quote.validUntil,
        amountCents: quote.totalCents,
        clientId: quote.clientId,
        clientLabel: label,
      });
    }
  }

  for (const sub of subscriptions) {
    if (
      !isSubscriptionDueSoon({
        status: sub.status,
        nextBillingDate: sub.nextBillingDate,
        now,
      })
    ) {
      continue;
    }
    const due = sub.nextBillingDate!;
    const isPast = due < now;
    push({
      id: `subscription_due:${sub.id}`,
      kind: "subscription_due",
      priority: TODAY_ACTION_PRIORITY.subscription_due,
      title: `${TODAY_ACTION_LABEL.subscription_due} · ${sub.label}`,
      detail: isPast
        ? `Échéance le ${due.toLocaleDateString("fr-FR")} — à facturer`
        : `Prochaine facturation le ${due.toLocaleDateString("fr-FR")}`,
      href: dashboardHref(slug, `clients/${sub.clientId}/overview`),
      dueAt: due,
      amountCents: sub.priceCents,
      clientId: sub.clientId,
      clientLabel: clientLabel(clientMap, sub.clientId),
    });
  }

  for (const quote of acceptedQuotes) {
    if (invoiceQuoteIds.has(quote.id)) continue;
    push({
      id: `accepted_quote_without_invoice:${quote.id}`,
      kind: "accepted_quote_without_invoice",
      priority: TODAY_ACTION_PRIORITY.accepted_quote_without_invoice,
      title: `${TODAY_ACTION_LABEL.accepted_quote_without_invoice} · ${quote.number}`,
      detail: "Créer la facture associée",
      href: dashboardHref(slug, `quotes/${quote.id}`),
      dueAt: quote.acceptedAt,
      amountCents: quote.totalCents,
      clientId: quote.clientId,
      clientLabel: clientLabel(clientMap, quote.clientId),
    });
  }

  return sortTodayActions(actions);
}
