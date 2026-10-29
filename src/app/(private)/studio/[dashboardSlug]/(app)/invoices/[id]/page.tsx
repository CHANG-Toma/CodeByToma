import Link from "next/link";
import {
  cancelInvoiceAction,
  createPaymentAction,
  issueInvoiceAction,
} from "@/app/(private)/actions";
import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { invoiceStatusLabel, paymentMethodLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { getClient } from "@/server/application/clients";
import { getInvoice } from "@/server/application/invoices";
import { listPayments } from "@/server/application/payments";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const invoice = await getInvoice(id);
  const [client, payments] = await Promise.all([
    getClient(invoice.clientId),
    listPayments(id),
  ]);

  async function issue() {
    "use server";
    await issueInvoiceAction(id);
  }
  async function cancel() {
    "use server";
    await cancelInvoiceAction(id);
  }
  async function pay(formData: FormData) {
    "use server";
    formData.set("invoiceId", id);
    await createPaymentAction(formData);
  }

  const remaining = Math.max(0, invoice.totalCents - invoice.paidCents);

  return (
    <div>
      <PageHeader
        title={`Facture ${invoice.number}`}
        description={client.companyName || client.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <a
              href={dashboardHref(dashboardSlug, `invoices/${id}/pdf`)}
              className="inline-flex items-center justify-center rounded-md bg-dash-btn px-4 py-2 text-sm font-medium text-dash-on-btn hover:bg-dash-btn-hover"
            >
              Télécharger PDF
            </a>
            {invoice.status === "draft" ? (
              <form action={issue}>
                <PrimaryButton>Émettre</PrimaryButton>
              </form>
            ) : null}
            {invoice.status !== "paid" && invoice.status !== "cancelled" ? (
              <form action={cancel}>
                <SecondaryButton>Annuler</SecondaryButton>
              </form>
            ) : null}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <StatusBadge label={invoiceStatusLabel[invoice.status]} />
        <span className="text-dash-muted">
          Émise : {invoice.issuedAt?.toLocaleDateString("fr-FR") ?? "—"}
        </span>
        <span className="text-dash-muted">
          Échéance : {invoice.dueAt?.toLocaleDateString("fr-FR") ?? "—"}
        </span>
      </div>

      <Panel className="mb-6 overflow-x-auto p-0">
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
          <p>TTC : {formatEur(invoice.totalCents)}</p>
          <p>Payé : {formatEur(invoice.paidCents)}</p>
          <p className="font-medium text-dash-text">
            Reste dû : {formatEur(remaining)}
          </p>
        </div>
      </Panel>

      {remaining > 0 &&
      invoice.status !== "cancelled" &&
      invoice.status !== "draft" ? (
        <Panel className="mb-6 max-w-xl">
          <h2 className="mb-4 text-sm font-medium text-dash-text">
            Enregistrer un paiement
          </h2>
          <form action={pay} className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Montant (€)"
              name="amountEuros"
              type="number"
              required
              defaultValue={(remaining / 100).toFixed(2)}
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-dash-muted">Méthode</span>
              <select
                name="method"
                className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
                defaultValue="bank_transfer"
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

      <Panel>
        <h2 className="mb-3 text-sm font-medium text-dash-text">Paiements</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-dash-muted">Aucun paiement.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 text-dash-soft">
                <span>
                  {p.paidAt.toLocaleDateString("fr-FR")} —{" "}
                  {paymentMethodLabel[p.method] ?? p.method}
                  {p.reference ? ` (${p.reference})` : ""}
                </span>
                <span className="text-dash-text">{formatEur(p.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <p className="mt-4 text-sm">
        <Link
          href={dashboardHref(dashboardSlug, `clients/${client.id}`)}
          className="text-dash-accent hover:underline"
        >
          Fiche client
        </Link>
      </p>
    </div>
  );
}
