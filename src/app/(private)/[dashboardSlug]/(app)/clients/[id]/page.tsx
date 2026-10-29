import Link from "next/link";
import {
  deleteClientAction,
  updateClientAction,
} from "@/app/(private)/actions";
import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  TextArea,
} from "@/components/dashboard/ui";
import {
  invoiceStatusLabel,
  quoteStatusLabel,
  subscriptionStatusLabel,
} from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { getClientDetail } from "@/server/application/clients";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

function quoteTone(status: string) {
  if (status === "accepted") return "ok" as const;
  if (status === "sent") return "info" as const;
  if (status === "rejected" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

export default async function ClientDetailPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const { client, quotes, invoices, subscriptions } = await getClientDetail(id);

  async function save(formData: FormData) {
    "use server";
    await updateClientAction(id, formData);
  }

  async function remove() {
    "use server";
    await deleteClientAction(id);
  }

  return (
    <div>
      <PageHeader
        title={client.companyName || client.name}
        description={client.email}
        actions={
          <div className="flex gap-2">
            <Link href={dashboardHref(dashboardSlug, `quotes/new?clientId=${id}`)}>
              <PrimaryButton type="button">Nouveau devis</PrimaryButton>
            </Link>
            <form action={remove}>
              <SecondaryButton>Archiver</SecondaryButton>
            </form>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-4 text-sm font-medium text-white">Fiche</h2>
          <form action={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" name="name" required defaultValue={client.name} />
            <Field
              label="E-mail"
              name="email"
              type="email"
              required
              defaultValue={client.email}
            />
            <Field label="Téléphone" name="phone" defaultValue={client.phone ?? ""} />
            <Field
              label="Société"
              name="companyName"
              defaultValue={client.companyName ?? ""}
            />
            <div className="sm:col-span-2">
              <Field
                label="Adresse"
                name="billingAddress"
                defaultValue={client.billingAddress ?? ""}
              />
            </div>
            <Field
              label="Code postal"
              name="billingPostalCode"
              defaultValue={client.billingPostalCode ?? ""}
            />
            <Field
              label="Ville"
              name="billingCity"
              defaultValue={client.billingCity ?? ""}
            />
            <Field
              label="Pays"
              name="billingCountry"
              defaultValue={client.billingCountry}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Notes"
                name="notes"
                defaultValue={client.notes ?? ""}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#c5d0de]">
              <input
                type="checkbox"
                name="consentContract"
                defaultChecked={client.consentContract}
              />
              Consentement contrat
            </label>
            <label className="flex items-center gap-2 text-sm text-[#c5d0de]">
              <input
                type="checkbox"
                name="consentMarketing"
                defaultChecked={client.consentMarketing}
              />
              Consentement marketing
            </label>
            <div className="sm:col-span-2">
              <PrimaryButton>Enregistrer</PrimaryButton>
            </div>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">Devis</h2>
            </div>
            {quotes.length === 0 ? (
              <p className="text-sm text-[#8fa0b5]">Aucun devis.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={dashboardHref(dashboardSlug, `quotes/${q.id}`)}
                      className="text-white hover:underline"
                    >
                      {q.number}
                    </Link>
                    <StatusBadge
                      label={quoteStatusLabel[q.status]}
                      tone={quoteTone(q.status)}
                    />
                    <span className="text-[#c5d0de]">{formatEur(q.totalCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <h2 className="mb-3 text-sm font-medium text-white">Factures</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-[#8fa0b5]">Aucune facture.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2">
                    <Link
                      href={dashboardHref(dashboardSlug, `invoices/${inv.id}`)}
                      className="text-white hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <StatusBadge label={invoiceStatusLabel[inv.status]} />
                    <span className="text-[#c5d0de]">
                      {formatEur(inv.totalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <h2 className="mb-3 text-sm font-medium text-white">Abonnements</h2>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-[#8fa0b5]">Aucun abonnement.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {subscriptions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span className="text-white">{s.label}</span>
                    <StatusBadge
                      label={subscriptionStatusLabel[s.status]}
                      tone={s.status === "active" ? "ok" : "neutral"}
                    />
                    <span className="text-[#c5d0de]">
                      {formatEur(s.priceCents)}/mois
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
