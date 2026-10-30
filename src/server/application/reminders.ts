import { NotFoundError, ValidationError } from "@/server/domain/errors";
import {
  buildMailtoHref,
  buildReminderDraft,
  type ReminderDraft,
  type ReminderKind,
} from "@/server/domain/reminder-templates";
import {
  isInvoiceOverdue,
  isQuoteExpired,
  isQuoteExpiringSoon,
  isQuoteFollowUpDue,
} from "@/server/domain/today-actions";
import { deps } from "./container";

export type PreparedReminder = ReminderDraft & {
  to: string;
  entity: "quote" | "invoice";
  entityId: string;
  documentNumber: string;
  clientId: string;
  clientLabel: string;
  amountCents: number;
  mailtoHref: string;
};

function issuerName(): string {
  return process.env.INVOICE_ISSUER_NAME?.trim() || "CodeByToma";
}

function detectQuoteReminderKind(quote: {
  status: string;
  sentAt: Date | null;
  createdAt: Date;
  validUntil: Date | null;
}): ReminderKind {
  const now = new Date();
  if (
    isQuoteExpired({
      status: quote.status,
      validUntil: quote.validUntil,
      now,
    })
  ) {
    return "quote_expired";
  }
  if (
    isQuoteExpiringSoon({
      status: quote.status,
      validUntil: quote.validUntil,
      now,
    })
  ) {
    return "quote_expiring";
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
    return "quote_follow_up";
  }
  if (quote.status === "sent") {
    return "quote_follow_up";
  }
  throw new ValidationError(
    "Ce devis n’est pas dans un état à relancer (attendu : envoyé).",
  );
}

export async function prepareQuoteReminder(
  quoteId: string,
): Promise<PreparedReminder> {
  const quote = await deps.quotes.findById(quoteId);
  if (!quote) throw new NotFoundError("Devis", quoteId);

  const client = await deps.clients.findById(quote.clientId);
  if (!client || client.deletedAt) {
    throw new NotFoundError("Client", quote.clientId);
  }

  const kind = detectQuoteReminderKind(quote);
  const clientLabel = client.companyName || client.name;
  const draft = buildReminderDraft({
    kind,
    clientName: client.name,
    documentNumber: quote.number,
    amountCents: quote.totalCents,
    dueOrValidUntil: quote.validUntil,
    issuerName: issuerName(),
  });

  return {
    ...draft,
    to: client.email,
    entity: "quote",
    entityId: quote.id,
    documentNumber: quote.number,
    clientId: client.id,
    clientLabel,
    amountCents: quote.totalCents,
    mailtoHref: buildMailtoHref(client.email, draft.subject, draft.text),
  };
}

export async function prepareInvoiceReminder(
  invoiceId: string,
): Promise<PreparedReminder> {
  const invoice = await deps.invoices.findById(invoiceId);
  if (!invoice) throw new NotFoundError("Facture", invoiceId);

  const now = new Date();
  if (
    !isInvoiceOverdue({
      status: invoice.status,
      dueAt: invoice.dueAt,
      now,
    })
  ) {
    throw new ValidationError(
      "Cette facture n’est pas en retard — relance non proposée.",
    );
  }

  const client = await deps.clients.findById(invoice.clientId);
  if (!client || client.deletedAt) {
    throw new NotFoundError("Client", invoice.clientId);
  }

  const remaining = Math.max(0, invoice.totalCents - invoice.paidCents);
  const clientLabel = client.companyName || client.name;
  const draft = buildReminderDraft({
    kind: "invoice_overdue",
    clientName: client.name,
    documentNumber: invoice.number,
    amountCents: remaining || invoice.totalCents,
    dueOrValidUntil: invoice.dueAt,
    issuerName: issuerName(),
  });

  return {
    ...draft,
    to: client.email,
    entity: "invoice",
    entityId: invoice.id,
    documentNumber: invoice.number,
    clientId: client.id,
    clientLabel,
    amountCents: remaining || invoice.totalCents,
    mailtoHref: buildMailtoHref(client.email, draft.subject, draft.text),
  };
}

/** Trace audit après envoi manuel (mailto) ou log mailer. */
export async function markReminderSent(input: {
  entity: "quote" | "invoice";
  entityId: string;
  kind: ReminderKind;
  channel: "mailto" | "log" | "copy";
}): Promise<void> {
  await deps.audit.append({
    action: "reminder.sent",
    entity: input.entity === "quote" ? "Quote" : "Invoice",
    entityId: input.entityId,
    metadata: { kind: input.kind, channel: input.channel },
  });
}
