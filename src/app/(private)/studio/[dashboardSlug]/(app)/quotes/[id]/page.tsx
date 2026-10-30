import { redirect } from "next/navigation";
import { clientQuoteHref } from "@/lib/dashboard-href";
import { getQuote } from "@/server/application/quotes";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

/** Ancienne URL globale → espace client. */
export default async function QuoteDetailRedirectPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const quote = await getQuote(id);
  redirect(clientQuoteHref(dashboardSlug, quote.clientId, quote.id));
}
