import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listQuotes } from "@/server/application/quotes";
import { listClients } from "@/server/application/clients";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function QuotesPage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { q, status } = await searchParams;
  const [quotes, clients] = await Promise.all([
    listQuotes({
      search: q,
      status: status as
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | undefined,
    }),
    listClients(),
  ]);
  const clientName = new Map(clients.map((c) => [c.id, c.companyName || c.name]));

  return (
    <div>
      <PageHeader
        title="Devis"
        description="Création, envoi et acceptation."
        actions={
          <PrimaryLink href={dashboardHref(dashboardSlug, "quotes/new")}>
            Nouveau devis
          </PrimaryLink>
        }
      />

      <form className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="N° ou client…"
          className="w-full max-w-xs rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(quoteStatusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <PrimaryButton>Filtrer</PrimaryButton>
      </form>

      {quotes.length === 0 ? (
        <EmptyState
          title="Aucun devis"
          description="Créez un devis depuis un client ou via le bouton ci-dessus."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">N°</th>
                <th className="px-5 py-3 font-medium">Client</th>
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
                  <td className="px-5 py-3 text-dash-soft">
                    {clientName.get(quote.clientId) ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={quoteStatusLabel[quote.status]} />
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
