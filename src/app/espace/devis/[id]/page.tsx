import Link from "next/link";
import { notFound } from "next/navigation";
import {
  acceptPortalQuoteAction,
  rejectPortalQuoteAction,
} from "@/app/(private)/actions";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { quoteStatusLabel } from "@/lib/dashboard-labels";
import { formatEur } from "@/server/domain/money";
import { DomainError } from "@/server/domain/errors";
import { getPortalQuote } from "@/server/application/portal";
import { requireClient } from "@/server/infrastructure/auth/session";

type Props = { params: Promise<{ id: string }> };

export default async function EspaceDevisDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireClient();
  let quote;
  try {
    quote = await getPortalQuote(session.clientId, id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }

  async function accept() {
    "use server";
    await acceptPortalQuoteAction(id);
  }
  async function reject() {
    "use server";
    await rejectPortalQuoteAction(id);
  }

  return (
    <div>
      <PageHeader
        title={`Devis ${quote.number}`}
        description={
          quote.validUntil
            ? `Valable jusqu’au ${quote.validUntil.toLocaleDateString("fr-FR")}`
            : "Proposition commerciale"
        }
        actions={
          quote.status === "sent" ? (
            <div className="flex flex-wrap gap-2">
              <form action={accept}>
                <PrimaryButton>Accepter le devis</PrimaryButton>
              </form>
              <form action={reject}>
                <SecondaryButton>Refuser</SecondaryButton>
              </form>
            </div>
          ) : null
        }
      />

      <div className="mb-4">
        <StatusBadge
          label={quoteStatusLabel[quote.status]}
          tone={
            quote.status === "accepted"
              ? "ok"
              : quote.status === "sent"
                ? "info"
                : quote.status === "rejected"
                  ? "danger"
                  : "neutral"
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
        <p className="mt-4 text-sm text-dash-muted">{quote.notes}</p>
      ) : null}

      <p className="mt-6 text-sm">
        <Link href="/espace/devis" className="text-dash-accent hover:underline">
          ← Retour aux devis
        </Link>
      </p>
    </div>
  );
}
