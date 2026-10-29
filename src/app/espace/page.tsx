import Link from "next/link";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { quoteStatusLabel, invoiceStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { getPortalHome } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

export default async function EspaceHomePage() {
  const session = await requireClient();
  const home = await getPortalHome(session.clientId);
  const displayName =
    home.client.companyName || home.client.name || "votre espace";

  const cards = [
    {
      label: "Devis en attente",
      value: String(home.pendingQuotes.length),
      href: "/espace/devis",
    },
    {
      label: "Factures à régler",
      value: String(home.openInvoices.length),
      href: "/espace/factures",
    },
    {
      label: "Documents",
      value: String(home.counts.quotes + home.counts.invoices),
      href: "/espace/devis",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Bonjour${home.client.name ? `, ${home.client.name.split(" ")[0]}` : ""}`}
        description={`Bienvenue dans l’espace client de ${displayName}. Consultez vos devis et factures.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Panel className="transition hover:border-sky-500/30">
              <p className="text-xs uppercase tracking-wide text-dash-muted">
                {card.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-dash-text">
                {card.value}
              </p>
            </Panel>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium text-dash-soft">
            Devis à traiter
          </h2>
          {home.pendingQuotes.length === 0 ? (
            <Panel>
              <p className="text-sm text-dash-muted">
                Aucun devis en attente de votre réponse.
              </p>
            </Panel>
          ) : (
            <Panel className="space-y-3 p-4">
              {home.pendingQuotes.slice(0, 4).map((quote) => (
                <Link
                  key={quote.id}
                  href={`/espace/devis/${quote.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-dash-hover"
                >
                  <div>
                    <p className="text-sm font-medium text-dash-text">
                      {quote.number}
                    </p>
                    <p className="text-xs text-dash-muted">
                      {formatEur(quote.totalCents)}
                    </p>
                  </div>
                  <StatusBadge
                    label={quoteStatusLabel[quote.status]}
                    tone="info"
                  />
                </Link>
              ))}
            </Panel>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-dash-soft">
            Factures ouvertes
          </h2>
          {home.openInvoices.length === 0 ? (
            <Panel>
              <p className="text-sm text-dash-muted">
                Aucune facture en cours.
              </p>
            </Panel>
          ) : (
            <Panel className="space-y-3 p-4">
              {home.openInvoices.slice(0, 4).map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/espace/factures/${invoice.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-dash-hover"
                >
                  <div>
                    <p className="text-sm font-medium text-dash-text">
                      {invoice.number}
                    </p>
                    <p className="text-xs text-dash-muted">
                      {formatEur(invoice.totalCents)}
                    </p>
                  </div>
                  <StatusBadge
                    label={invoiceStatusLabel[invoice.status]}
                    tone={invoice.status === "overdue" ? "danger" : "warn"}
                  />
                </Link>
              ))}
            </Panel>
          )}
        </section>
      </div>
    </div>
  );
}
