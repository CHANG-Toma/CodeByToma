import Link from "next/link";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listPortalInvoices } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

function invoiceTone(status: string) {
  if (status === "paid") return "ok" as const;
  if (status === "overdue") return "danger" as const;
  if (status === "issued" || status === "partially_paid") return "warn" as const;
  return "neutral" as const;
}

export default async function EspaceFacturesPage() {
  const session = await requireClient();
  const invoices = await listPortalInvoices(session.clientId);

  return (
    <div>
      <PageHeader
        title="Mes factures"
        description="Suivi de vos factures et téléchargement PDF."
      />

      {invoices.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Vos factures apparaîtront ici après acceptation d’un devis ou émission."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">N°</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Total TTC</th>
                <th className="px-5 py-3 font-medium">Émise le</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-dash-border">
                  <td className="px-5 py-3">
                    <Link
                      href={`/espace/factures/${invoice.id}`}
                      className="font-medium text-dash-text hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={invoiceStatusLabel[invoice.status]}
                      tone={invoiceTone(invoice.status)}
                    />
                  </td>
                  <td className="px-5 py-3">
                    {formatEur(invoice.totalCents)}
                  </td>
                  <td className="px-5 py-3 text-dash-muted">
                    {(invoice.issuedAt ?? invoice.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
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
