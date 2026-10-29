import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listPortalQuotes } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

function quoteTone(status: string) {
  if (status === "accepted") return "ok" as const;
  if (status === "sent") return "info" as const;
  if (status === "rejected" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

export default async function EspaceDevisPage() {
  const session = await requireClient();
  const quotes = await listPortalQuotes(session.clientId);

  return (
    <div>
      <PageHeader
        title="Mes devis"
        description="Consultez et validez les devis qui vous ont été envoyés."
      />

      {quotes.length === 0 ? (
        <EmptyState
          title="Aucun devis"
          description="Dès qu’un devis vous sera envoyé, il apparaîtra ici."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">N°</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Total TTC</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-dash-border">
                  <td className="px-5 py-3">
                    <Link
                      href={`/espace/devis/${quote.id}`}
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
