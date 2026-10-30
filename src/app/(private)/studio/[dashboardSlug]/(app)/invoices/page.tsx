import Link from "next/link";
import {
  cancelInvoiceAction,
  issueInvoiceAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { RowActions, RowActionsHeader } from "@/components/dashboard/RowActions";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { clientInvoiceHref, dashboardHref } from "@/lib/dashboard-href";
import { formatEur } from "@/lib/money";
import { invoiceListActions } from "@/lib/row-actions";
import { listClients } from "@/server/application/clients";
import { listInvoices } from "@/server/application/invoices";

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
  const clientName = new Map(
    clients.map((c) => [c.id, c.companyName || c.name]),
  );

  return (
    <div>
      <PageHeader
        title="Factures"
        description="Les factures sont créées depuis un devis accepté."
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
          description="Acceptez un devis pour générer automatiquement une facture."
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
                <RowActionsHeader />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const invoiceId = inv.id;
                async function issue() {
                  "use server";
                  await issueInvoiceAction(invoiceId);
                }
                async function cancel() {
                  "use server";
                  await cancelInvoiceAction(invoiceId);
                }

                return (
                  <tr key={inv.id} className="border-b border-dash-border">
                    <td className="px-5 py-3">
                      <Link
                        href={clientInvoiceHref(
                          dashboardSlug,
                          inv.clientId,
                          inv.id,
                        )}
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
                    <RowActions
                      actions={invoiceListActions({
                        slug: dashboardSlug,
                        clientId: inv.clientId,
                        invoiceId: inv.id,
                        status: inv.status,
                        remainingCents: Math.max(
                          0,
                          inv.totalCents - inv.paidCents,
                        ),
                        issueAction: issue,
                        cancelAction: cancel,
                      })}
                    />
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
