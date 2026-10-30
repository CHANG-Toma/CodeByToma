import { notFound } from "next/navigation";
import { QuoteDetail } from "@/components/dashboard/QuoteDetail";
import { getClient } from "@/server/application/clients";
import { findActiveInvoiceForQuote } from "@/server/application/invoices";
import { getQuote } from "@/server/application/quotes";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string; quoteId: string }>;
};

export default async function ClientQuoteDetailPage({ params }: Props) {
  const { dashboardSlug, id, quoteId } = await params;
  const quote = await getQuote(quoteId);
  if (quote.clientId !== id) notFound();
  const [client, linkedInvoice] = await Promise.all([
    getClient(id),
    findActiveInvoiceForQuote(quoteId),
  ]);

  return (
    <QuoteDetail
      quote={quote}
      client={client}
      linkedInvoice={linkedInvoice}
      dashboardSlug={dashboardSlug}
    />
  );
}
