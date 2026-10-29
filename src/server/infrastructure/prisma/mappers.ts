import type {
  CatalogOffer,
  Client,
  Invoice,
  InvoiceLine,
  Payment,
  Quote,
  QuoteLine,
  Subscription,
} from "@prisma/client";
import type {
  CatalogOfferRecord,
  ClientRecord,
  InvoiceRecord,
  LineRecord,
  PaymentRecord,
  QuoteRecord,
  SubscriptionRecord,
} from "@/server/domain/ports/repositories";
import type { OfferKind } from "@/server/domain/catalog";
import type {
  InvoiceStatus,
  QuoteStatus,
  SubscriptionStatus,
} from "@/server/domain/status-transitions";

export function mapClient(c: Client): ClientRecord {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    companyName: c.companyName,
    billingAddress: c.billingAddress,
    billingCity: c.billingCity,
    billingPostalCode: c.billingPostalCode,
    billingCountry: c.billingCountry,
    notes: c.notes,
    consentMarketing: c.consentMarketing,
    consentContract: c.consentContract,
    deletedAt: c.deletedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function mapLine(
  line: QuoteLine | InvoiceLine,
): LineRecord {
  return {
    id: line.id,
    label: line.label,
    description: line.description,
    quantity: Number(line.quantity),
    unitPriceHtCents: line.unitPriceHtCents,
    taxRatePercent: Number(line.taxRatePercent),
    position: line.position,
  };
}

export function mapQuote(
  q: Quote & { lines: QuoteLine[] },
): QuoteRecord {
  return {
    id: q.id,
    number: q.number,
    clientId: q.clientId,
    status: q.status as QuoteStatus,
    currency: q.currency,
    validUntil: q.validUntil,
    notes: q.notes,
    subtotalCents: q.subtotalCents,
    taxCents: q.taxCents,
    totalCents: q.totalCents,
    acceptedAt: q.acceptedAt,
    sentAt: q.sentAt,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
    lines: q.lines
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapLine),
  };
}

export function mapInvoice(
  inv: Invoice & { lines: InvoiceLine[] },
): InvoiceRecord {
  return {
    id: inv.id,
    number: inv.number,
    sequentialNumber: inv.sequentialNumber,
    clientId: inv.clientId,
    quoteId: inv.quoteId,
    status: inv.status as InvoiceStatus,
    currency: inv.currency,
    issuedAt: inv.issuedAt,
    dueAt: inv.dueAt,
    notes: inv.notes,
    subtotalCents: inv.subtotalCents,
    taxCents: inv.taxCents,
    totalCents: inv.totalCents,
    paidCents: inv.paidCents,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
    lines: inv.lines
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapLine),
  };
}

export function mapSubscription(s: Subscription): SubscriptionRecord {
  return {
    id: s.id,
    clientId: s.clientId,
    offerKind: s.offerKind as OfferKind,
    label: s.label,
    priceCents: s.priceCents,
    currency: s.currency,
    status: s.status as SubscriptionStatus,
    startDate: s.startDate,
    endDate: s.endDate,
    nextBillingDate: s.nextBillingDate,
    commitmentMonths: s.commitmentMonths,
    notes: s.notes,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function mapPayment(p: Payment): PaymentRecord {
  return {
    id: p.id,
    invoiceId: p.invoiceId,
    amountCents: p.amountCents,
    currency: p.currency,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt,
    reference: p.reference,
    notes: p.notes,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function mapCatalogOffer(o: CatalogOffer): CatalogOfferRecord {
  return {
    id: o.id,
    kind: o.kind as OfferKind,
    label: o.label,
    description: o.description,
    priceCents: o.priceCents,
    currency: o.currency,
    isActive: o.isActive,
  };
}
