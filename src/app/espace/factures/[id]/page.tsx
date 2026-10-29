import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PageHeader,
  Panel,
  PrimaryLink,
  StatusBadge,
} from "@/components/dashboard/ui";
import { invoiceStatusLabel } from "@/lib/dashboard-labels";
import { DomainError } from "@/server/domain/errors";
import { formatEur } from "@/server/domain/money";
import { getPortalInvoice } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

type Props = { params: Promise<{ id: string }> };

export default async function EspaceFactureDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireClient();
  let invoice;
  try {
    invoice = await getPortalInvoice(session.clientId, id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }

  return (
    <div>
      <PageHeader
        title={`Facture ${invoice.number}`}
        description={
          invoice.dueAt
            ? `Échéance le ${invoice.dueAt.toLocaleDateString("fr-FR")}`
            : "Document de facturation"
        }
        actions={
          <PrimaryLink href={`/espace/factures/${id}/pdf`}>
            Télécharger le PDF
          </PrimaryLink>
        }
      />

      <div className="mb-4">
        <StatusBadge
          label={invoiceStatusLabel[invoice.status]}
          tone={
            invoice.status === "paid"
              ? "ok"
              : invoice.status === "overdue"
                ? "danger"
                : "warn"
          }
        />
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-dash-border text-dash-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Libellé</th>
              <th className="px-5 py-3 font-medium">Qté</th>
              <th className="px-5 py-3 font-medium">P.U. HT</th>
              <th className="px-5 py-3 font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-dash-border">
                <td className="px-5 py-3 text-dash-text">{line.label}</td>
                <td className="px-5 py-3">{line.quantity}</td>
                <td className="px-5 py-3">
                  {formatEur(line.unitPriceHtCents)}
                </td>
                <td className="px-5 py-3">
                  {formatEur(Math.round(line.quantity * line.unitPriceHtCents))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 px-5 py-4 text-right text-sm">
          <p>HT : {formatEur(invoice.subtotalCents)}</p>
          <p>TVA : {formatEur(invoice.taxCents)}</p>
          <p className="text-base font-medium text-dash-text">
            TTC : {formatEur(invoice.totalCents)}
          </p>
        </div>
      </Panel>

      <p className="mt-6 text-sm">
        <Link
          href="/espace/factures"
          className="text-dash-accent hover:underline"
        >
          ← Retour aux factures
        </Link>
      </p>
    </div>
  );
}
