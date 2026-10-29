import Link from "next/link";
import {
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { paymentMethodLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { listInvoices } from "@/server/application/invoices";
import { listPayments } from "@/server/application/payments";
import { createPaymentAction } from "@/app/(private)/actions";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";
import { revalidatePath } from "next/cache";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function PaymentsPage({ params }: Props) {
  const { dashboardSlug } = await params;
  const [payments, invoices] = await Promise.all([
    listPayments(),
    listInvoices(),
  ]);

  const openInvoices = invoices.filter(
    (i) =>
      i.status === "issued" ||
      i.status === "partially_paid" ||
      i.status === "overdue",
  );
  const invoiceNumber = new Map(invoices.map((i) => [i.id, i.number]));

  async function pay(formData: FormData) {
    "use server";
    await createPaymentAction(formData);
    revalidatePath(`/${dashboardSlug}/payments`);
  }

  return (
    <div>
      <PageHeader
        title="Paiements"
        description="Enregistrements manuels rattachés aux factures."
      />

      {openInvoices.length > 0 ? (
        <Panel className="mb-8 max-w-2xl">
          <h2 className="mb-4 text-sm font-medium text-dash-text">
            Nouveau paiement
          </h2>
          <form action={pay} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block text-dash-muted">Facture</span>
              <select
                name="invoiceId"
                required
                className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
                defaultValue=""
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {openInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.number} — reste{" "}
                    {formatEur(Math.max(0, inv.totalCents - inv.paidCents))}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Montant (€)" name="amountEuros" type="number" required />
            <label className="block text-sm">
              <span className="mb-1.5 block text-dash-muted">Méthode</span>
              <select
                name="method"
                defaultValue="bank_transfer"
                className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
              >
                {Object.entries(paymentMethodLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Date" name="paidAt" type="date" />
            <Field label="Référence" name="reference" />
            <div className="sm:col-span-2">
              <PrimaryButton>Enregistrer</PrimaryButton>
            </div>
          </form>
        </Panel>
      ) : null}

      {payments.length === 0 ? (
        <EmptyState
          title="Aucun paiement"
          description="Les paiements apparaîtront ici dès qu'une facture sera réglée."
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
                      href={dashboardHref(
                        dashboardSlug,
                        `invoices/${p.invoiceId}`,
                      )}
                      className="text-dash-text hover:underline"
                    >
                      {invoiceNumber.get(p.invoiceId) ?? p.invoiceId}
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
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
