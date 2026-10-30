import {
  cancelSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui";
import { RowActions, RowActionsHeader } from "@/components/dashboard/RowActions";
import { subscriptionStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/lib/money";
import { listSubscriptions } from "@/server/application/subscriptions";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

function subTone(status: string) {
  if (status === "active") return "ok" as const;
  if (status === "paused") return "warn" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export default async function ClientSubscriptionsPage({ params }: Props) {
  const { id } = await params;
  const subscriptions = await listSubscriptions({ clientId: id });

  return (
    <div>
      {subscriptions.length === 0 ? (
        <EmptyState
          title="Aucun abonnement"
          description="Les abonnements d’hébergement de ce client apparaîtront ici."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Offre</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium">Prochaine échéance</th>
                <RowActionsHeader />
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const subId = sub.id;
                async function pause() {
                  "use server";
                  await pauseSubscriptionAction(subId);
                }
                async function resume() {
                  "use server";
                  await resumeSubscriptionAction(subId);
                }
                async function cancel() {
                  "use server";
                  await cancelSubscriptionAction(subId);
                }

                const actions = [];
                if (sub.status === "active") {
                  actions.push({
                    kind: "button" as const,
                    label: "Mettre en pause",
                    formAction: pause,
                  });
                }
                if (sub.status === "paused") {
                  actions.push({
                    kind: "button" as const,
                    label: "Reprendre",
                    formAction: resume,
                  });
                }
                if (sub.status !== "cancelled") {
                  actions.push({
                    kind: "button" as const,
                    label: "Résilier",
                    formAction: cancel,
                    tone: "danger" as const,
                  });
                }

                return (
                  <tr key={sub.id} className="border-b border-dash-border">
                    <td className="px-5 py-3 font-medium text-dash-text">
                      {sub.label}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={subscriptionStatusLabel[sub.status]}
                        tone={subTone(sub.status)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      {formatEur(sub.priceCents)}/mois
                    </td>
                    <td className="px-5 py-3 text-dash-muted">
                      {sub.nextBillingDate?.toLocaleDateString("fr-FR") ?? "—"}
                    </td>
                    <RowActions actions={actions} />
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
