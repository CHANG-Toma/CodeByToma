import Link from "next/link";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { formatEur } from "@/lib/money";
import { dashboardHref } from "@/lib/dashboard-href";
import {
  feesToEuros,
  getOperationalFees,
} from "@/server/application/fees";
import { getDashboardKpis } from "@/server/application/invoices";
import { listTodayActions } from "@/server/application/today-actions";
import {
  TODAY_ACTION_LABEL,
  type TodayActionKind,
} from "@/server/domain/today-actions";

type Props = { params: Promise<{ dashboardSlug: string }> };

function actionTone(
  kind: TodayActionKind,
): "danger" | "warn" | "info" | "neutral" {
  switch (kind) {
    case "invoice_overdue":
    case "quote_expired":
      return "danger";
    case "subscription_due":
    case "quote_follow_up":
    case "quote_expiring":
      return "warn";
    case "accepted_quote_without_invoice":
      return "info";
    default:
      return "neutral";
  }
}

export default async function DashboardHomePage({ params }: Props) {
  const { dashboardSlug } = await params;
  const [kpis, todayActions, feesCents] = await Promise.all([
    getDashboardKpis(),
    listTodayActions(),
    getOperationalFees(),
  ]);
  const fees = feesToEuros(feesCents);

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
      href: "clients",
    },
  ];

  const tariffRefs = [
    {
      label: "Création vitrine",
      value: `${fees.setup} €`,
      hint: "Une fois",
    },
    {
      label: "Hébergement",
      value: `${fees.hosting} €`,
      hint: "/ mois · si chez toi",
    },
    {
      label: "Évolutions / projets",
      value: `${fees.tjm} €`,
      hint: "/ jour (TJM) · hors hébergement",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description={`Création / TJM en devis · hébergement ${fees.hosting} €/mois seulement si tu héberges.`}
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
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-medium text-dash-soft">
            À faire aujourd’hui
          </h2>
          {todayActions.length > 0 ? (
            <p className="text-xs text-dash-muted2">
              {todayActions.length} action
              {todayActions.length > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>

        {todayActions.length === 0 ? (
          <Panel>
            <p className="text-sm text-dash-muted">Rien à traiter pour le moment.</p>
          </Panel>
        ) : (
          <Panel className="overflow-x-auto p-0">
            <ul className="divide-y divide-dash-border">
              {todayActions.map((action) => (
                <li
                  key={action.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link href={action.href} className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        label={TODAY_ACTION_LABEL[action.kind]}
                        tone={actionTone(action.kind)}
                      />
                      {action.clientLabel ? (
                        <span className="text-xs text-dash-muted">
                          {action.clientLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm font-medium text-dash-text hover:underline">
                      {action.title}
                    </p>
                    <p className="text-xs text-dash-muted">{action.detail}</p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-left sm:text-right">
                      {action.amountCents != null ? (
                        <p className="text-sm font-medium text-dash-text">
                          {formatEur(action.amountCents)}
                        </p>
                      ) : null}
                      {action.dueAt ? (
                        <p className="text-xs text-dash-muted2">
                          {action.dueAt.toLocaleDateString("fr-FR")}
                        </p>
                      ) : null}
                    </div>
                    {action.remindHref ? (
                      <Link
                        href={action.remindHref}
                        className="rounded-md border border-dash-border px-3 py-1.5 text-xs text-dash-soft transition hover:bg-dash-hover"
                      >
                        Relancer
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-dash-soft">
          Grille de référence
        </h2>
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
    </div>
  );
}
