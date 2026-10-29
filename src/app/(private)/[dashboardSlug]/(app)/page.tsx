import Link from "next/link";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { formatEur } from "@/server/domain/money";
import { getDashboardKpis } from "@/server/application/invoices";
import { listUpcomingBillings } from "@/server/application/subscriptions";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function DashboardHomePage({ params }: Props) {
  const { dashboardSlug } = await params;
  const [kpis, upcoming] = await Promise.all([
    getDashboardKpis(),
    listUpcomingBillings(5),
  ]);

  const cards = [
    {
      label: "CA encaissé (mois)",
      value: formatEur(kpis.revenueCents),
      href: "payments",
    },
    {
      label: "Factures en retard",
      value: String(kpis.overdueInvoices),
      href: "invoices",
    },
    {
      label: "Devis en attente",
      value: String(kpis.pendingQuotes),
      href: "quotes",
    },
    {
      label: "Abonnements actifs",
      value: String(kpis.activeSubscriptions),
      href: "subscriptions",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité CodeByToma."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={dashboardHref(dashboardSlug, card.href)}>
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

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-dash-soft">
          Prochaines échéances abonnements
        </h2>
        {upcoming.length === 0 ? (
          <Panel>
            <p className="text-sm text-dash-muted">Aucune échéance à venir.</p>
          </Panel>
        ) : (
          <Panel className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-dash-border text-dash-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Offre</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Prochaine facturation</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((s) => (
                  <tr key={s.id} className="border-b border-dash-border">
                    <td className="px-5 py-3 text-dash-text">{s.label}</td>
                    <td className="px-5 py-3">{formatEur(s.priceCents)}</td>
                    <td className="px-5 py-3 text-dash-soft">
                      {s.nextBillingDate?.toLocaleDateString("fr-FR") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  );
}
