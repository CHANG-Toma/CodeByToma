import { notFound } from "next/navigation";
import { QuoteDetail } from "@/components/dashboard/QuoteDetail";
import { getClient } from "@/server/application/clients";
import { getQuote } from "@/server/application/quotes";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string; quoteId: string }>;
};

export default async function ClientQuoteDetailPage({ params }: Props) {
  const { dashboardSlug, id, quoteId } = await params;
  const quote = await getQuote(quoteId);
  if (quote.clientId !== id) notFound();
  const client = await getClient(id);

  return (
    <QuoteDetail
      quote={quote}
      client={client}
      dashboardSlug={dashboardSlug}
    />
  );
}
