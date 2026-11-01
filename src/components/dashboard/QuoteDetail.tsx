import Link from "next/link";
import {
  acceptQuoteAction,
  createInvoiceFromQuoteAction,
  deleteQuoteAction,
  rejectQuoteAction,
  sendQuoteAction,
} from "@/app/(private)/actions";
import { ConfirmServerActionButton } from "@/components/dashboard/ConfirmServerActionButton";
import { DeleteWithConfirm } from "@/components/dashboard/DeleteWithConfirm";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import {
  clientInvoiceHref,
  clientQuotesListHref,
  dashboardHref,
} from "@/lib/dashboard-href";
import { formatEur } from "@/lib/money";
import type {
  ClientRecord,
  InvoiceRecord,
  QuoteRecord,
} from "@/server/domain/ports/repositories";

type Props = {
  quote: QuoteRecord;
  client: ClientRecord;
  linkedInvoice: InvoiceRecord | null;
  dashboardSlug: string;
};

export function QuoteDetail({
  quote,
  client,
  linkedInvoice,
  dashboardSlug,
}: Props) {
  const id = quote.id;

  async function send() {
    "use server";
    await sendQuoteAction(id);
  }
  async function accept() {
    "use server";
    await acceptQuoteAction(id);
  }
  async function reject() {
    "use server";
    await rejectQuoteAction(id);
  }
  async function remove() {
    "use server";
    return deleteQuoteAction(id);
  }
  async function createInvoice() {
    "use server";
    await createInvoiceFromQuoteAction(id);
  }

  return (
    <div>
      <PageHeader
        title={`Devis ${quote.number}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {quote.status === "draft" ? (
              <form action={send}>
                <PrimaryButton>Marquer envoyé</PrimaryButton>
              </form>
            ) : null}
            {quote.status === "sent" ? (
              <form action={accept}>
                <PrimaryButton>Accepter → facture</PrimaryButton>
              </form>
            ) : null}
            {quote.status === "accepted" && linkedInvoice ? (
              <Link
                href={clientInvoiceHref(
                  dashboardSlug,
                  client.id,
                  linkedInvoice.id,
                )}
                className="inline-flex items-center justify-center rounded-md bg-dash-btn px-4 py-2 text-sm font-medium text-dash-on-btn transition hover:bg-dash-btn-hover"
              >
                Voir facture {linkedInvoice.number}
              </Link>
            ) : null}
            {quote.status === "accepted" && !linkedInvoice ? (
              <form action={createInvoice}>
                <PrimaryButton>Créer la facture</PrimaryButton>
              </form>
            ) : null}
            {quote.status === "draft" || quote.status === "sent" ? (
              <ConfirmServerActionButton
                confirmMessage="Refuser ce devis ? Il ne comptera plus parmi les devis en attente."
                label="Refuser"
                action={reject}
              />
            ) : null}
            <DeleteWithConfirm
              confirmMessage={`Supprimer définitivement le devis ${quote.number} ? Cette action ne peut pas être annulée.`}
              performDelete={remove}
              successRedirect={clientQuotesListHref(dashboardSlug, client.id)}
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge label={quoteStatusLabel[quote.status]} tone="info" />
        <Link
          href={clientQuotesListHref(dashboardSlug, client.id)}
          className="text-xs text-dash-muted hover:underline"
        >
          Tous les devis
        </Link>
        {linkedInvoice ? (
          <Link
            href={clientInvoiceHref(
              dashboardSlug,
              client.id,
              linkedInvoice.id,
            )}
            className="text-xs text-dash-muted hover:underline"
          >
            Facture {linkedInvoice.number}
          </Link>
        ) : null}
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
            {quote.lines.map((line) => (
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
          <p>HT : {formatEur(quote.subtotalCents)}</p>
          <p>TVA : {formatEur(quote.taxCents)}</p>
          <p className="text-base font-medium text-dash-text">
            TTC : {formatEur(quote.totalCents)}
          </p>
        </div>
      </Panel>

      {quote.notes ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-dash-muted">
          {quote.notes}
        </p>
      ) : null}

      <p className="mt-4 text-sm text-dash-muted">
        <Link
          href={dashboardHref(dashboardSlug, `clients/${client.id}/quotes`)}
          className="hover:underline"
        >
          Fiche client
        </Link>
      </p>
    </div>
  );
}
