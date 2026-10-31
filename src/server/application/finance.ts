import {
  computeExpectedRevenueCents,
  invoiceDaysLate,
  quoteAgeDays,
  type FinanceSnapshot,
} from "@/server/domain/finance-snapshot";
import { isInvoiceOverdue } from "@/server/domain/today-actions";
import { deps } from "./container";

function clientDisplayLabel(c: {
  name: string;
  companyName: string | null;
}): string {
  return c.companyName || c.name;
}

export async function getFinanceSnapshot(now = new Date()): Promise<FinanceSnapshot> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    collectedCents,
    invoicedCents,
    sentQuotes,
    invoices,
    activeSubs,
    prefs,
  ] = await Promise.all([
    deps.invoices.sumPaidInPeriod(monthStart, nextMonth),
    deps.invoices.sumInvoicedInPeriod(monthStart, nextMonth),
    deps.quotes.list({ status: "sent" }),
    deps.invoices.list(),
    deps.subscriptions.list({ status: "active" }),
    deps.adminPrefs.get(),
  ]);

  const clients = await deps.clients.list();
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const pendingQuotes = sentQuotes.map((q) => {
    const client = clientMap.get(q.clientId);
    return {
      id: q.id,
      number: q.number,
      clientLabel: client ? clientDisplayLabel(client) : "Client",
      totalCents: q.totalCents,
      sentAt: q.sentAt?.toISOString() ?? null,
      ageDays: quoteAgeDays(q.sentAt, q.createdAt, now),
    };
  });

  const unpaidInvoices = invoices
    .filter((inv) => {
      if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "draft") {
        return false;
      }
      const remaining = inv.totalCents - inv.paidCents;
      if (remaining <= 0) return false;
      return (
        inv.status === "overdue" ||
        isInvoiceOverdue({ status: inv.status, dueAt: inv.dueAt, now })
      );
    })
    .map((inv) => {
      const client = clientMap.get(inv.clientId);
      const remaining = Math.max(0, inv.totalCents - inv.paidCents);
      return {
        id: inv.id,
        number: inv.number,
        clientLabel: client ? clientDisplayLabel(client) : "Client",
        remainingCents: remaining,
        dueAt: inv.dueAt?.toISOString() ?? null,
        status: inv.status,
        daysLate: invoiceDaysLate(inv.dueAt, now),
      };
    });

  const activeSubscriptions = activeSubs.map((sub) => {
    const client = clientMap.get(sub.clientId);
    return {
      id: sub.id,
      clientLabel: client ? clientDisplayLabel(client) : "Client",
      label: sub.label,
      priceCents: sub.priceCents,
      nextBillingDate: sub.nextBillingDate?.toISOString() ?? null,
    };
  });

  const monthlyRecurringCents = activeSubs.reduce(
    (sum, s) => sum + s.priceCents,
    0,
  );
  const pendingQuotesTotalCents = sentQuotes.reduce(
    (sum, q) => sum + q.totalCents,
    0,
  );

  return {
    period: { month: now.getMonth() + 1, year: now.getFullYear() },
    collectedCents,
    invoicedCents,
    pendingQuotes,
    unpaidInvoices,
    activeSubscriptions,
    monthlyRecurringCents,
    expectedRevenueCents: computeExpectedRevenueCents({
      pendingQuotesTotalCents,
      monthlyRecurringCents,
    }),
    monthlyRevenueGoalCents: prefs.monthlyRevenueGoalCents,
  };
}

export async function getDashboardRevenueOutlook(now = new Date()) {
  const snapshot = await getFinanceSnapshot(now);
  return {
    collectedCents: snapshot.collectedCents,
    expectedRevenueCents: snapshot.expectedRevenueCents,
    monthlyRevenueGoalCents: snapshot.monthlyRevenueGoalCents,
  };
}
