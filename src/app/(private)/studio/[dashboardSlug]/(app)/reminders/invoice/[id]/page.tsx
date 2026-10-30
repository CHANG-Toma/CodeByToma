import Link from "next/link";
import { notFound } from "next/navigation";
import { markReminderSentAction } from "@/app/(private)/actions";
import { ReminderDraftActions } from "@/components/dashboard/ReminderDraftActions";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { formatEur } from "@/lib/money";
import { clientInvoiceHref } from "@/lib/dashboard-href";
import { prepareInvoiceReminder } from "@/server/application/reminders";
import { DomainError } from "@/server/domain/errors";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function InvoiceReminderPage({ params }: Props) {
  const { dashboardSlug, id } = await params;

  let reminder;
  try {
    reminder = await prepareInvoiceReminder(id);
  } catch (e) {
    if (e instanceof DomainError) notFound();
    throw e;
  }

  const kind = reminder.kind;

  async function markSent() {
    "use server";
    await markReminderSentAction({
      entity: "invoice",
      entityId: id,
      kind,
      channel: "mailto",
    });
  }

  return (
    <div>
      <PageHeader
        title={`Relance · ${reminder.documentNumber}`}
        description={reminder.clientLabel}
        actions={
          <Link
            href={clientInvoiceHref(
              dashboardSlug,
              reminder.clientId,
              reminder.entityId,
            )}
            className="text-sm text-dash-soft hover:underline"
          >
            Voir la facture
          </Link>
        }
      />

      <Panel className="space-y-5">
        <div className="grid gap-1 text-sm">
          <p className="text-dash-muted">À</p>
          <p className="text-dash-text">{reminder.to}</p>
        </div>
        <div className="grid gap-1 text-sm">
          <p className="text-dash-muted">Objet</p>
          <p className="text-dash-text">{reminder.subject}</p>
        </div>
        <div className="grid gap-1 text-sm">
          <p className="text-dash-muted">Message</p>
          <pre className="whitespace-pre-wrap rounded-md border border-dash-border bg-dash-input px-4 py-3 font-sans text-sm text-dash-text">
            {reminder.text}
          </pre>
        </div>
        <p className="text-sm text-dash-muted">
          Montant : {formatEur(reminder.amountCents)}
        </p>
        <ReminderDraftActions
          mailtoHref={reminder.mailtoHref}
          subject={reminder.subject}
          text={reminder.text}
          markSentAction={markSent}
        />
      </Panel>
    </div>
  );
}