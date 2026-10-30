import Link from "next/link";
import {
  EmptyState,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui";
import { RowActions, RowActionsHeader } from "@/components/dashboard/RowActions";
import { paymentMethodLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/lib/money";
import { clientInvoiceHref } from "@/lib/dashboard-href";
import { listInvoices } from "@/server/application/invoices";
import { listPaymentsForClient } from "@/server/application/payments";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientPaymentsPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const [invoices, payments] = await Promise.all([
    listInvoices({ clientId: id }),
    listPaymentsForClient(id),
  ]);
  const invoiceById = new Map(invoices.map((i) => [i.id, i]));

  return (
    <div>
      {payments.length === 0 ? (
        <EmptyState
          title="Aucun paiement"
          description="Les paiements liés aux factures de ce client apparaîtront ici."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Facture</th>
                <th className="px-5 py-3 font-medium">Méthode</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <RowActionsHeader />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-dash-border">
                  <td className="px-5 py-3 text-dash-soft">
                    {p.paidAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={clientInvoiceHref(dashboardSlug, id, p.invoiceId)}
                      className="text-dash-text hover:underline"
                    >
                      {invoiceById.get(p.invoiceId)?.number ?? "Facture"}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    {paymentMethodLabel[p.method] ?? p.method}
                  </td>
                  <td className="px-5 py-3">{formatEur(p.amountCents)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={p.status}
                      tone={p.status === "completed" ? "ok" : "neutral"}
                    />
                  </td>
                  <RowActions
                    actions={[
                      {
                        kind: "link",
                        label: "Voir facture",
                        href: clientInvoiceHref(
                          dashboardSlug,
                          id,
                          p.invoiceId,
                        ),
                      },
                    ]}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
