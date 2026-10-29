import {
  EmptyState,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { subscriptionStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listSubscriptions } from "@/server/application/subscriptions";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientSubscriptionsPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const subscriptions = await listSubscriptions({ clientId: id });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <PrimaryLink href={dashboardHref(dashboardSlug, "subscriptions")}>
          Gérer les abonnements
        </PrimaryLink>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState
          title="Aucun abonnement"
          description="Liez une offre mensuelle à ce client depuis la page Abonnements."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Offre</th>
                <th className="px-5 py-3 font-medium">Prix</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Prochaine échéance</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-dash-border">
                  <td className="px-5 py-3 text-dash-text">{s.label}</td>
                  <td className="px-5 py-3">{formatEur(s.priceCents)}/mois</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={subscriptionStatusLabel[s.status]}
                      tone={s.status === "active" ? "ok" : "neutral"}
                    />
                  </td>
                  <td className="px-5 py-3 text-dash-muted">
                    {s.nextBillingDate?.toLocaleDateString("fr-FR") ?? "—"}
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
