import Link from "next/link";
import {
  EmptyState,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listQuotes } from "@/server/application/quotes";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

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
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-dash-border">
                  <td className="px-5 py-3">
                    <Link
                      href={dashboardHref(dashboardSlug, `quotes/${quote.id}`)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
