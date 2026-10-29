import Link from "next/link";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { hostingFee, setupFee, tjmFee } from "@/data/pricing";
import { formatEur } from "@/server/domain/money";
import { getDashboardKpis } from "@/server/application/invoices";
import { listQuotes } from "@/server/application/quotes";
import { listUpcomingBillings } from "@/server/application/subscriptions";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function DashboardHomePage({ params }: Props) {
  const { dashboardSlug } = await params;
  const [kpis, pendingQuotes, upcoming] = await Promise.all([
    getDashboardKpis(),
    listQuotes({ status: "sent" }),
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

  const tariffRefs = [
    {
      label: "Création vitrine",
      value: `${setupFee.amount} €`,
      hint: "Une fois",
    },
    {
      label: "Hébergement",
      value: `${hostingFee.amount} €`,
      hint: "/ mois · si chez toi",
    },
    {
      label: "Évolutions / projets",
      value: `${tjmFee.amount} €`,
      hint: "/ jour (TJM) · hors hébergement",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Création / TJM en devis · hébergement 30 €/mois seulement si tu héberges."
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
          Grille de référence
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-dash-muted">
          Hébergement = infra uniquement. Toute modification ou amélioration se
          facture au TJM (lignes de devis / facture), pas dans les 30 €.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {tariffRefs.map((ref) => (
            <Panel key={ref.label}>
              <p className="text-xs uppercase tracking-wide text-dash-muted">
                {ref.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-dash-text">
                {ref.value}
              </p>
              <p className="mt-1 text-xs text-dash-muted2">{ref.hint}</p>
            </Panel>
          ))}
        </div>
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
                  <th className="px-5 py-3 font-medium">Échéance</th>
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

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-dash-soft">
          Devis en attente de réponse
        </h2>
        {pendingQuotes.length === 0 ? (
          <Panel>
            <p className="text-sm text-dash-muted">Aucun devis en attente.</p>
          </Panel>
        ) : (
          <Panel className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-dash-border text-dash-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">N°</th>
                  <th className="px-5 py-3 font-medium">Total TTC</th>
                  <th className="px-5 py-3 font-medium">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {pendingQuotes.slice(0, 8).map((q) => (
                  <tr key={q.id} className="border-b border-dash-border">
                    <td className="px-5 py-3">
                      <Link
                        href={dashboardHref(dashboardSlug, `quotes/${q.id}`)}
                        className="font-medium text-dash-text hover:underline"
                      >
                        {q.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{formatEur(q.totalCents)}</td>
                    <td className="px-5 py-3 text-dash-soft">
                      {q.createdAt.toLocaleDateString("fr-FR")}
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
