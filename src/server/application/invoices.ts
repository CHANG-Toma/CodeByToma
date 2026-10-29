import { ConflictError, NotFoundError, ValidationError } from "@/server/domain/errors";
import {
  assertInvoiceTransition,
  invoiceStatusAfterPayment,
  type InvoiceStatus,
} from "@/server/domain/status-transitions";
import { calculateDocumentTotals } from "@/server/domain/totals";
import type { InvoiceRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { invoiceCreateSchema, invoiceStatusSchema } from "./schemas";

function mapLines(
  lines: Array<{
    label: string;
    description?: string | null;
    quantity: number;
    unitPriceHtCents: number;
    taxRatePercent: number;
    position?: number;
  }>,
) {
  return lines.map((l, index) => ({
    label: l.label,
    description: l.description ?? null,
    quantity: l.quantity,
    unitPriceHtCents: l.unitPriceHtCents,
    taxRatePercent: l.taxRatePercent,
    position: l.position ?? index,
  }));
}

export async function listInvoices(filters?: {
  clientId?: string;
  status?: InvoiceStatus;
  search?: string;
}): Promise<InvoiceRecord[]> {
  return deps.invoices.list(filters);
}

export async function getInvoice(id: string): Promise<InvoiceRecord> {
  const invoice = await deps.invoices.findById(id);
  if (!invoice) throw new NotFoundError("Facture", id);
  return invoice;
}

export async function createInvoice(input: unknown): Promise<InvoiceRecord> {
  const parsed = invoiceCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const client = await deps.clients.findById(parsed.data.clientId);
  if (!client) throw new NotFoundError("Client", parsed.data.clientId);

  const lines = mapLines(parsed.data.lines);
  const totals = calculateDocumentTotals(lines);
  const year = new Date().getFullYear();
  const { sequential, number } = await deps.invoices.nextSequential(year);
  const issueNow = parsed.data.issueNow;
  const issuedAt = issueNow ? new Date() : null;
  const dueAt =
    parsed.data.dueAt ??
    (issueNow
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null);

  const invoice = await deps.invoices.create({
    clientId: parsed.data.clientId,
    quoteId: parsed.data.quoteId ?? null,
    number,
    sequentialNumber: sequential,
    status: issueNow ? "issued" : "draft",
    issuedAt,
    dueAt,
    notes: parsed.data.notes ?? null,
    subtotalCents: totals.subtotalCents,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    lines,
  });

  await deps.audit.append({
    action: "invoice.created",
    entity: "Invoice",
    entityId: invoice.id,
    metadata: { number: invoice.number },
  });

  return invoice;
}

export async function createInvoiceFromQuote(
  quoteId: string,
): Promise<InvoiceRecord> {
  const quote = await deps.quotes.findById(quoteId);
  if (!quote) throw new NotFoundError("Devis", quoteId);
  if (quote.status !== "accepted") {
    throw new ConflictError("Le devis doit être accepté avant facturation");
  }

  const existing = await deps.invoices.list({ clientId: quote.clientId });
  if (existing.some((i) => i.quoteId === quoteId && i.status !== "cancelled")) {
    throw new ConflictError("Une facture existe déjà pour ce devis");
  }

  return createInvoice({
    clientId: quote.clientId,
    quoteId: quote.id,
    notes: quote.notes,
    lines: quote.lines.map((l) => ({
      label: l.label,
      description: l.description,
      quantity: l.quantity,
      unitPriceHtCents: l.unitPriceHtCents,
      taxRatePercent: l.taxRatePercent,
      position: l.position,
    })),
    issueNow: true,
  });
}

export async function transitionInvoice(
  id: string,
  input: unknown,
): Promise<InvoiceRecord> {
  const parsed = invoiceStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Statut invalide");
  }

  const invoice = await getInvoice(id);
  assertInvoiceTransition(invoice.status, parsed.data.status);

  const patch: Parameters<typeof deps.invoices.update>[1] = {
    status: parsed.data.status,
  };
  if (parsed.data.status === "issued" && !invoice.issuedAt) {
    patch.issuedAt = new Date();
    patch.dueAt =
      invoice.dueAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const updated = await deps.invoices.update(id, patch);
  await deps.audit.append({
    action: "invoice.status_changed",
    entity: "Invoice",
    entityId: id,
    metadata: { from: invoice.status, to: parsed.data.status },
  });
  return updated;
}

export async function applyPaymentToInvoice(
  invoiceId: string,
): Promise<InvoiceRecord> {
  const invoice = await getInvoice(invoiceId);
  const paidCents = await deps.payments.sumByInvoice(invoiceId);
  const nextStatus = invoiceStatusAfterPayment(
    invoice.status,
    invoice.totalCents,
    paidCents,
  );
  return deps.invoices.update(invoiceId, {
    paidCents,
    status: nextStatus,
  });
}

export async function getDashboardKpis() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [revenueCents, overdueCount, pendingQuotes, clients] =
    await Promise.all([
      deps.invoices.sumPaidInPeriod(monthStart, nextMonth),
      deps.invoices.countByStatus("overdue"),
      deps.quotes.list({ status: "sent" }),
      deps.clients.list(),
    ]);

  // Also count issued past due as overdue candidates for KPI
  const issued = await deps.invoices.list({ status: "issued" });
  const lateIssued = issued.filter(
    (i) => i.dueAt && i.dueAt < now,
  ).length;

  return {
    revenueCents,
    overdueInvoices: overdueCount + lateIssued,
    pendingQuotes: pendingQuotes.length,
    activeClients: clients.length,
  };
}
