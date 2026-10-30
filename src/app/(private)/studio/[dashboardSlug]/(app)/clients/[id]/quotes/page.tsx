import Link from "next/link";
import {
  acceptQuoteAction,
  rejectQuoteAction,
  sendQuoteAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { RowActions, RowActionsHeader } from "@/components/dashboard/RowActions";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { clientQuoteHref, dashboardHref } from "@/lib/dashboard-href";
import { formatEur } from "@/lib/money";
import { quoteListActions } from "@/lib/row-actions";
import { listQuotes } from "@/server/application/quotes";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

function quoteTone(status: string) {
  if (status === "accepted") return "ok" as const;
  if (status === "sent") return "info" as const;
  if (status === "rejected" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

export default async function ClientQuotesPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const quotes = await listQuotes({ clientId: id });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <PrimaryLink
          href={dashboardHref(dashboardSlug, `quotes/new?clientId=${id}`)}
        >
          Nouveau devis
        </PrimaryLink>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          title="Aucun devis"
          description="Créez un devis pour ce client pour démarrer le cycle commercial."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">N°</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Total TTC</th>
                <th className="px-5 py-3 font-medium">Créé le</th>
                <RowActionsHeader />
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const quoteId = quote.id;
                async function send() {
                  "use server";
                  await sendQuoteAction(quoteId);
                }
                async function accept() {
                  "use server";
                  await acceptQuoteAction(quoteId);
                }
                async function reject() {
                  "use server";
                  await rejectQuoteAction(quoteId);
                }

                return (
                  <tr key={quote.id} className="border-b border-dash-border">
                    <td className="px-5 py-3">
                      <Link
                        href={clientQuoteHref(dashboardSlug, id, quote.id)}
                        className="font-medium text-dash-text hover:underline"
                      >
                        {quote.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={quoteStatusLabel[quote.status]}
                        tone={quoteTone(quote.status)}
                      />
                    </td>
                    <td className="px-5 py-3">{formatEur(quote.totalCents)}</td>
                    <td className="px-5 py-3 text-dash-muted">
                      {quote.createdAt.toLocaleDateString("fr-FR")}
                    </td>
                    <RowActions
                      actions={quoteListActions({
                        slug: dashboardSlug,
                        clientId: id,
                        quoteId: quote.id,
                        status: quote.status,
                        includeClientLink: false,
                        sendAction: send,
                        acceptAction: accept,
                        rejectAction: reject,
                      })}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
