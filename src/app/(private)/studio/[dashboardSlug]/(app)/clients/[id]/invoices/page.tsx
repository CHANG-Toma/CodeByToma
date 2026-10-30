import Link from "next/link";
import {
  cancelInvoiceAction,
  issueInvoiceAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { RowActions, RowActionsHeader } from "@/components/dashboard/RowActions";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { clientInvoiceHref, dashboardHref } from "@/lib/dashboard-href";
import { formatEur } from "@/lib/money";
import { invoiceListActions } from "@/lib/row-actions";
import { listInvoices } from "@/server/application/invoices";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientInvoicesPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const invoices = await listInvoices({ clientId: id });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <PrimaryLink
          href={dashboardHref(dashboardSlug, `clients/${id}/quotes`)}
        >
          Voir les devis
        </PrimaryLink>
      </div>

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
                        href={clientInvoiceHref(dashboardSlug, id, inv.id)}
                        className="font-medium text-dash-text hover:underline"
                      >
                        {inv.number}
                      </Link>
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
                        clientId: id,
                        invoiceId: inv.id,
                        status: inv.status,
                        includeClientLink: false,
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
