import {
  cancelSubscriptionAction,
  createSubscriptionAction,
  pauseSubscriptionAction,
  resumeSubscriptionAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { subscriptionStatusLabel } from "@/lib/dashboard-labels";
import { OFFER_KINDS } from "@/server/domain/catalog";
import { formatEur } from "@/server/domain/money";
import { listClients } from "@/server/application/clients";
import {
  listSubscriptions,
  listUpcomingBillings,
} from "@/server/application/subscriptions";
import { deps } from "@/server/application/container";
import { redirect } from "next/navigation";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function SubscriptionsPage({ params }: Props) {
  const { dashboardSlug } = await params;
  const [subs, clients, offers, upcoming] = await Promise.all([
    listSubscriptions(),
    listClients(),
    deps.catalog.listActive(),
    listUpcomingBillings(8),
  ]);
  const clientName = new Map(clients.map((c) => [c.id, c.companyName || c.name]));

  async function create(formData: FormData) {
    "use server";
    const result = await createSubscriptionAction(formData);
    if (result.ok) {
      redirect(dashboardHref(dashboardSlug, "subscriptions"));
    }
  }

  return (
    <div>
      <PageHeader
        title="Abonnements"
        description="Essentiel, Sérénité, Premium — engagement type 12 mois."
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-sm font-medium text-white">Nouvel abonnement</h2>
          <form action={create} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block text-[#8fa0b5]">Client</span>
              <select
                name="clientId"
                required
                defaultValue=""
                className="w-full rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white"
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block text-[#8fa0b5]">Offre</span>
              <select
                name="offerKind"
                required
                defaultValue="serenite"
                className="w-full rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white"
              >
                {OFFER_KINDS.filter((k) => k !== "setup").map((kind) => {
                  const offer = offers.find((o) => o.kind === kind);
                  return (
                    <option key={kind} value={kind}>
                      {offer?.label ?? kind}
                      {offer && offer.priceCents > 0
                        ? ` (${formatEur(offer.priceCents)}/mois)`
                        : ""}
                    </option>
                  );
                })}
              </select>
            </label>
            <Field
              label="Date de début"
              name="startDate"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
            <Field
              label="Prix (€) — optionnel"
              name="priceEuros"
              type="number"
              placeholder="Laisser vide = tarif catalogue"
            />
            <div className="sm:col-span-2">
              <PrimaryButton>Créer</PrimaryButton>
            </div>
          </form>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-sm font-medium text-white">
            Prochaines échéances
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#8fa0b5]">Aucune.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {upcoming.map((s) => (
                <li key={s.id} className="flex justify-between gap-2">
                  <span className="text-white">
                    {clientName.get(s.clientId)} — {s.label}
                  </span>
                  <span className="text-[#8fa0b5]">
                    {s.nextBillingDate?.toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {subs.length === 0 ? (
        <EmptyState
          title="Aucun abonnement"
          description="Liez un client à une offre mensuelle pour suivre les échéances."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[#8fa0b5]">
              <tr>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Offre</th>
                <th className="px-5 py-3 font-medium">Prix</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Prochaine</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="px-5 py-3 text-white">
                    {clientName.get(s.clientId) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[#c5d0de]">{s.label}</td>
                  <td className="px-5 py-3">{formatEur(s.priceCents)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={subscriptionStatusLabel[s.status]}
                      tone={s.status === "active" ? "ok" : "neutral"}
                    />
                  </td>
                  <td className="px-5 py-3 text-[#8fa0b5]">
                    {s.nextBillingDate?.toLocaleDateString("fr-FR") ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {s.status === "active" ? (
                        <form
                          action={async () => {
                            "use server";
                            await pauseSubscriptionAction(s.id);
                          }}
                        >
                          <SecondaryButton>Pause</SecondaryButton>
                        </form>
                      ) : null}
                      {s.status === "paused" ? (
                        <form
                          action={async () => {
                            "use server";
                            await resumeSubscriptionAction(s.id);
                          }}
                        >
                          <SecondaryButton>Reprendre</SecondaryButton>
                        </form>
                      ) : null}
                      {s.status !== "cancelled" ? (
                        <form
                          action={async () => {
                            "use server";
                            await cancelSubscriptionAction(s.id);
                          }}
                        >
                          <SecondaryButton>Résilier</SecondaryButton>
                        </form>
                      ) : null}
                    </div>
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
