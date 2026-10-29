import Link from "next/link";
import {
  acceptQuoteAction,
  rejectQuoteAction,
  sendQuoteAction,
} from "@/app/(private)/actions";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { getClient } from "@/server/application/clients";
import { getQuote } from "@/server/application/quotes";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function QuoteDetailPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const quote = await getQuote(id);
  const client = await getClient(quote.clientId);

  async function send() {
    "use server";
    await sendQuoteAction(id);
  }
  async function accept() {
    "use server";
    await acceptQuoteAction(id);
  }
  async function reject() {
    "use server";
    await rejectQuoteAction(id);
  }

  return (
    <div>
      <PageHeader
        title={`Devis ${quote.number}`}
        description={client.companyName || client.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {quote.status === "draft" ? (
              <form action={send}>
                <PrimaryButton>Marquer envoyé</PrimaryButton>
              </form>
            ) : null}
            {quote.status === "sent" || quote.status === "accepted" ? (
              <form action={accept}>
                <PrimaryButton>Accepter → facture</PrimaryButton>
              </form>
            ) : null}
            {quote.status === "draft" || quote.status === "sent" ? (
              <form action={reject}>
                <SecondaryButton>Refuser</SecondaryButton>
              </form>
            ) : null}
          </div>
        }
      />

      <div className="mb-4">
        <StatusBadge label={quoteStatusLabel[quote.status]} tone="info" />
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-dash-border text-dash-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Libellé</th>
              <th className="px-5 py-3 font-medium">Qté</th>
              <th className="px-5 py-3 font-medium">P.U. HT</th>
              <th className="px-5 py-3 font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line) => (
              <tr key={line.id} className="border-b border-dash-border">
                <td className="px-5 py-3 text-dash-text">{line.label}</td>
                <td className="px-5 py-3">{line.quantity}</td>
                <td className="px-5 py-3">
                  {formatEur(line.unitPriceHtCents)}
                </td>
                <td className="px-5 py-3">
                  {formatEur(Math.round(line.quantity * line.unitPriceHtCents))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 px-5 py-4 text-right text-sm">
          <p>HT : {formatEur(quote.subtotalCents)}</p>
          <p>TVA : {formatEur(quote.taxCents)}</p>
          <p className="text-base font-medium text-dash-text">
            TTC : {formatEur(quote.totalCents)}
          </p>
        </div>
      </Panel>

      <p className="mt-4 text-sm text-dash-muted">
        <Link
          href={dashboardHref(dashboardSlug, `clients/${client.id}`)}
          className="text-dash-accent hover:underline"
        >
          Voir la fiche client
        </Link>
      </p>
    </div>
  );
}
