import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/domain/errors";
import type { ClientRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import {
  acceptQuoteAndCreateInvoice,
  getQuote,
  listQuotes,
  transitionQuote,
} from "./quotes";
import { getInvoice, listInvoices } from "./invoices";
import { listSubscriptions } from "./subscriptions";
import { getClient } from "./clients";
import { portalProfileUpdateSchema } from "./schemas";

function assertOwnsClient(clientId: string, resourceClientId: string) {
  if (clientId !== resourceClientId) {
    throw new ForbiddenError();
  }
}

export async function getPortalHome(clientId: string) {
  const [client, quotes, invoices, subscriptions] = await Promise.all([
    getClient(clientId),
    listQuotes({ clientId }),
    listInvoices({ clientId }),
    listSubscriptions({ clientId }),
  ]);

  const visibleQuotes = quotes.filter((q) => q.status !== "draft");
  const visibleInvoices = invoices.filter((i) => i.status !== "draft");
  const pendingQuotes = visibleQuotes.filter((q) => q.status === "sent");
  const openInvoices = visibleInvoices.filter(
    (i) =>
      i.status === "issued" ||
      i.status === "partially_paid" ||
      i.status === "overdue",
  );
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active" || s.status === "paused",
  );

  return {
    client,
    pendingQuotes,
    openInvoices,
    activeSubscriptions,
    counts: {
      quotes: visibleQuotes.length,
      invoices: visibleInvoices.length,
      subscriptions: activeSubscriptions.length,
    },
  };
}

export async function listPortalSubscriptions(clientId: string) {
  return listSubscriptions({ clientId });
}

export async function listPortalQuotes(clientId: string) {
  const quotes = await listQuotes({ clientId });
  return quotes.filter((q) => q.status !== "draft");
}

export async function getPortalQuote(clientId: string, quoteId: string) {
  const quote = await getQuote(quoteId);
  assertOwnsClient(clientId, quote.clientId);
  if (quote.status === "draft") {
    throw new NotFoundError("Devis", quoteId);
  }
  return quote;
}

export async function acceptPortalQuote(clientId: string, quoteId: string) {
  const quote = await getPortalQuote(clientId, quoteId);
  if (quote.status !== "sent") {
    throw new ConflictError("Seul un devis envoyé peut être accepté.");
  }
  return acceptQuoteAndCreateInvoice(quoteId);
}

export async function rejectPortalQuote(clientId: string, quoteId: string) {
  const quote = await getPortalQuote(clientId, quoteId);
  if (quote.status !== "sent") {
    throw new ConflictError("Seul un devis envoyé peut être refusé.");
  }
  return transitionQuote(quoteId, { status: "rejected" });
}

export async function listPortalInvoices(clientId: string) {
  const invoices = await listInvoices({ clientId });
  return invoices.filter((i) => i.status !== "draft");
}

export async function getPortalInvoice(clientId: string, invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  assertOwnsClient(clientId, invoice.clientId);
  if (invoice.status === "draft") {
    throw new NotFoundError("Facture", invoiceId);
  }
  return invoice;
}

export async function updatePortalProfile(
  clientId: string,
  input: unknown,
): Promise<ClientRecord> {
  const parsed = portalProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }
  const client = await getClient(clientId);
  const updated = await deps.clients.update(clientId, {
    ...parsed.data,
    notes: client.notes,
  });
  await deps.audit.append({
    action: "portal.profile_updated",
    entity: "Client",
    entityId: clientId,
  });
  return updated;
}
