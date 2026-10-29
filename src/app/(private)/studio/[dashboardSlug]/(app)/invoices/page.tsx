import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listClients } from "@/server/application/clients";
import { listInvoices } from "@/server/application/invoices";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function InvoicesPage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { q, status } = await searchParams;
  const [invoices, clients] = await Promise.all([
    listInvoices({
      search: q,
      status: status as
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "cancelled"
        | undefined,
    }),
    listClients(),
  ]);
  const clientName = new Map(clients.map((c) => [c.id, c.companyName || c.name]));

  return (
    <div>
      <PageHeader
        title="Factures"
        description="Émission, paiements et PDF."
        actions={
          <PrimaryLink href={dashboardHref(dashboardSlug, "invoices/new")}>
            Nouvelle facture
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
          {Object.entries(invoiceStatusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <PrimaryButton>Filtrer</PrimaryButton>
      </form>

      {invoices.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Générez une facture depuis un devis accepté ou créez-en une manuellement."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">N°</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payé</th>
                <th className="px-5 py-3 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-dash-border">
                  <td className="px-5 py-3">
                    <Link
                      href={dashboardHref(dashboardSlug, `invoices/${inv.id}`)}
                      className="font-medium text-dash-text hover:underline"
                    >
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-dash-soft">
                    {clientName.get(inv.clientId) ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={invoiceStatusLabel[inv.status]} />
                  </td>
                  <td className="px-5 py-3">{formatEur(inv.totalCents)}</td>
                  <td className="px-5 py-3">{formatEur(inv.paidCents)}</td>
                  <td className="px-5 py-3 text-dash-muted">
                    {inv.dueAt?.toLocaleDateString("fr-FR") ?? "—"}
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
