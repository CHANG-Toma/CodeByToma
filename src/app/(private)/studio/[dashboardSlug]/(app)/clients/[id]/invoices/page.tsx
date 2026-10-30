import Link from "next/link";
import {
  EmptyState,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { clientInvoiceHref, dashboardHref } from "@/lib/dashboard-href";
import { formatEur } from "@/lib/money";
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
          href={dashboardHref(dashboardSlug, `invoices/new?clientId=${id}`)}
        >
          Nouvelle facture
        </PrimaryLink>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Générez une facture depuis un devis accepté, ou créez-en une manuellement."
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
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
