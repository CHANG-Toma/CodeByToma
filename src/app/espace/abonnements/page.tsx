import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui";
import { subscriptionStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listPortalSubscriptions } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

export default async function EspaceAbonnementsPage() {
  const session = await requireClient();
  const subscriptions = await listPortalSubscriptions(session.clientId);

  return (
    <div>
      <PageHeader
        title="Abonnements"
        description="Votre hébergement mensuel et les prochaines échéances."
      />

      {subscriptions.length === 0 ? (
        <EmptyState
          title="Aucun abonnement"
          description="Si vous hébergez chez CodeByToma, votre abonnement apparaîtra ici."
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
