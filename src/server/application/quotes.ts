import { addYears } from "@/lib/dates";
import { ConflictError, NotFoundError, ValidationError } from "@/server/domain/errors";
import { formatQuoteNumber } from "@/server/domain/invoice-numbering";
import {
  assertQuoteTransition,
  type QuoteStatus,
} from "@/server/domain/status-transitions";
import { calculateDocumentTotals } from "@/server/domain/totals";
import type { QuoteRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { createInvoiceFromQuote } from "./invoices";
import { quoteCreateSchema, quoteStatusSchema } from "./schemas";

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

export async function listQuotes(filters?: {
  clientId?: string;
  status?: QuoteStatus;
  search?: string;
}): Promise<QuoteRecord[]> {
  return deps.quotes.list(filters);
}

export async function getQuote(id: string): Promise<QuoteRecord> {
  const quote = await deps.quotes.findById(id);
  if (!quote) throw new NotFoundError("Devis", id);
  return quote;
}

export async function createQuote(input: unknown): Promise<QuoteRecord> {
  const parsed = quoteCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const client = await deps.clients.findById(parsed.data.clientId);
  if (!client) throw new NotFoundError("Client", parsed.data.clientId);

  const lines = mapLines(parsed.data.lines);
  const totals = calculateDocumentTotals(lines);
  const year = new Date().getFullYear();
  const count = await deps.quotes.countByYear(year);
  const number = formatQuoteNumber(year, count + 1);

  const quote = await deps.quotes.create({
    clientId: parsed.data.clientId,
    number,
    validUntil: parsed.data.validUntil ?? addYears(new Date(), 1),
    notes: parsed.data.notes ?? null,
    subtotalCents: totals.subtotalCents,
    taxCents: totals.taxCents,
    totalCents: totals.totalCents,
    lines,
  });

  await deps.audit.append({
    action: "quote.created",
    entity: "Quote",
    entityId: quote.id,
    metadata: { number: quote.number },
  });

  return quote;
}

export async function transitionQuote(
  id: string,
  input: unknown,
): Promise<QuoteRecord> {
  const parsed = quoteStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Statut invalide");
  }

  const quote = await getQuote(id);
  assertQuoteTransition(quote.status, parsed.data.status);

  const patch: Parameters<typeof deps.quotes.update>[1] = {
    status: parsed.data.status,
  };
  if (parsed.data.status === "sent") patch.sentAt = new Date();
  if (parsed.data.status === "accepted") patch.acceptedAt = new Date();

  const updated = await deps.quotes.update(id, patch);
  await deps.audit.append({
    action: "quote.status_changed",
    entity: "Quote",
    entityId: id,
    metadata: { from: quote.status, to: parsed.data.status },
  });
  return updated;
}

export async function acceptQuoteAndCreateInvoice(quoteId: string) {
  const quote = await getQuote(quoteId);
  if (quote.status !== "accepted" && quote.status !== "sent") {
    throw new ConflictError(
      "Seul un devis envoyé ou déjà accepté peut générer une facture",
    );
  }
  if (quote.status === "sent") {
    await transitionQuote(quoteId, { status: "accepted" });
  }
  return createInvoiceFromQuote(quoteId);
}
