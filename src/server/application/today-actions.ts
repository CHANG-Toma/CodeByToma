import {
  clientInvoiceHref,
  clientQuoteHref,
  dashboardHref,
} from "@/lib/dashboard-href";
import {
  getQuoteFollowUpMilestone,
  isInvoiceOverdue,
  isQuoteExpired,
  isQuoteExpiringSoon,
  isSubscriptionDueSoon,
  sortTodayActions,
  TODAY_ACTION_LABEL,
  TODAY_ACTION_PRIORITY,
  type TodayAction,
} from "@/server/domain/today-actions";
import { getDashboardBasePath } from "@/server/infrastructure/auth/dashboard-path";
import { buildTodayReminderDraft } from "./today-reminder-draft";
import { deps } from "./container";

type ClientRow = {
  name: string;
  email: string;
  companyName: string | null;
};

function clientLabel(clients: Map<string, ClientRow>, clientId: string): string {
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
    clients.map((c) => [
      c.id,
      { name: c.name, email: c.email, companyName: c.companyName },
    ]),
  );
  const invoiceQuoteIds = new Set(
    invoices.map((i) => i.quoteId),
  );

  const actions: TodayAction[] = [];
  const seen = new Set<string>();

  function push(action: TodayAction) {
    if (seen.has(action.id)) return;
    seen.add(action.id);
    actions.push(action);
  }

  function withReminder(
    action: TodayAction,
    input: {
      kind: TodayAction["kind"];
      clientId: string;
      documentNumber: string;
      amountCents: number;
      dueOrValidUntil: Date | null;
    },
  ): TodayAction {
    const client = clientMap.get(input.clientId);
    if (!client) return action;
    const draft = buildTodayReminderDraft({
      kind: input.kind,
      clientName: client.name,
      clientEmail: client.email,
      documentNumber: input.documentNumber,
      amountCents: input.amountCents,
      dueOrValidUntil: input.dueOrValidUntil,
    });
    return draft ? { ...action, reminderDraft: draft } : action;
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
    push(
      withReminder(
        {
          id: `invoice_overdue:${inv.id}`,
          kind: "invoice_overdue",
          priority: TODAY_ACTION_PRIORITY.invoice_overdue,
          title: `${TODAY_ACTION_LABEL.invoice_overdue} · ${inv.number}`,
          detail: inv.dueAt
            ? formatDaysLate(inv.dueAt, now)
            : "Échéance dépassée",
          href: clientInvoiceHref(slug, inv.clientId, inv.id),
          remindHref: dashboardHref(slug, `reminders/invoice/${inv.id}`),
          dueAt: inv.dueAt,
          amountCents: remaining,
          clientId: inv.clientId,
          clientLabel: clientLabel(clientMap, inv.clientId),
        },
        {
          kind: "invoice_overdue",
          clientId: inv.clientId,
          documentNumber: inv.number,
          amountCents: remaining,
          dueOrValidUntil: inv.dueAt,
        },
      ),
    );
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
      push(
        withReminder(
          {
            id: `quote_expired:${quote.id}`,
            kind: "quote_expired",
            priority: TODAY_ACTION_PRIORITY.quote_expired,
            title: `${TODAY_ACTION_LABEL.quote_expired} · ${quote.number}`,
            detail: quote.validUntil
              ? `Validité au ${quote.validUntil.toLocaleDateString("fr-FR")}`
              : "Validité dépassée",
            href: clientQuoteHref(slug, quote.clientId, quote.id),
            remindHref: dashboardHref(slug, `reminders/quote/${quote.id}`),
            dueAt: quote.validUntil,
            amountCents: quote.totalCents,
            clientId: quote.clientId,
            clientLabel: label,
          },
          {
            kind: "quote_expired",
            clientId: quote.clientId,
            documentNumber: quote.number,
            amountCents: quote.totalCents,
            dueOrValidUntil: quote.validUntil,
          },
        ),
      );
      continue;
    }

    const milestone = getQuoteFollowUpMilestone({
      status: quote.status,
      sentAt: quote.sentAt,
      createdAt: quote.createdAt,
      validUntil: quote.validUntil,
      now,
    });
    if (milestone) {
      const anchor = quote.sentAt ?? quote.createdAt;
      const days = Math.floor(
        (now.getTime() - anchor.getTime()) / (24 * 60 * 60 * 1000),
      );
      push(
        withReminder(
          {
            id: `quote_follow_up:${quote.id}:${milestone}`,
            kind: "quote_follow_up",
            priority: TODAY_ACTION_PRIORITY.quote_follow_up,
            title: `${TODAY_ACTION_LABEL.quote_follow_up} · ${quote.number}`,
            detail:
              milestone === 3
                ? `Sans réponse depuis ${days} jours (J+3)`
                : `Sans réponse depuis ${days} jours (J+7)`,
            href: clientQuoteHref(slug, quote.clientId, quote.id),
            remindHref: dashboardHref(slug, `reminders/quote/${quote.id}`),
            dueAt: anchor,
            amountCents: quote.totalCents,
            clientId: quote.clientId,
            clientLabel: label,
          },
          {
            kind: "quote_follow_up",
            clientId: quote.clientId,
            documentNumber: quote.number,
            amountCents: quote.totalCents,
            dueOrValidUntil: quote.validUntil,
          },
        ),
      );
      continue;
    }

    if (
      isQuoteExpiringSoon({
        status: quote.status,
        validUntil: quote.validUntil,
        now,
      })
    ) {
      push(
        withReminder(
          {
            id: `quote_expiring:${quote.id}`,
            kind: "quote_expiring",
            priority: TODAY_ACTION_PRIORITY.quote_expiring,
            title: `${TODAY_ACTION_LABEL.quote_expiring} · ${quote.number}`,
            detail: quote.validUntil
              ? `Expire le ${quote.validUntil.toLocaleDateString("fr-FR")}`
              : "Expiration proche",
            href: clientQuoteHref(slug, quote.clientId, quote.id),
            remindHref: dashboardHref(slug, `reminders/quote/${quote.id}`),
            dueAt: quote.validUntil,
            amountCents: quote.totalCents,
            clientId: quote.clientId,
            clientLabel: label,
          },
          {
            kind: "quote_expiring",
            clientId: quote.clientId,
            documentNumber: quote.number,
            amountCents: quote.totalCents,
            dueOrValidUntil: quote.validUntil,
          },
        ),
      );
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
      href: clientQuoteHref(slug, quote.clientId, quote.id),
      dueAt: quote.acceptedAt,
      amountCents: quote.totalCents,
      clientId: quote.clientId,
      clientLabel: clientLabel(clientMap, quote.clientId),
    });
  }

  return sortTodayActions(actions);
}
