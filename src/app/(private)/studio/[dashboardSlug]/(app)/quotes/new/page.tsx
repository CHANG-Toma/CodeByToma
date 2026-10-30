import Link from "next/link";
import { redirect } from "next/navigation";
import { createQuoteAction } from "@/app/(private)/actions";
import { LinesEditor } from "@/components/dashboard/LinesEditor";
import { QuoteValidityField } from "@/components/dashboard/QuoteValidityField";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { defaultQuoteValidUntil } from "@/lib/dates";
import { clientQuoteHref, dashboardHref } from "@/lib/dashboard-href";
import { listClients } from "@/server/application/clients";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewQuotePage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { clientId } = await searchParams;
  const clients = await listClients();
  const validUntilDefault = defaultQuoteValidUntil();

  async function action(formData: FormData) {
    "use server";
    const result = await createQuoteAction(formData);
    if (result.ok) {
      redirect(clientQuoteHref(dashboardSlug, result.clientId, result.id));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Nouveau devis"
        actions={
          <Link
            href={dashboardHref(dashboardSlug, "quotes")}
            className="text-sm text-dash-soft hover:underline"
          >
            Retour
          </Link>
        }
      />

      <form action={action} className="space-y-6">
        <Panel className="space-y-5">
          <div>
            <h2 className="text-sm font-medium text-dash-text">Client</h2>
            <label className="mt-3 block text-sm">
              <span className="sr-only">Client</span>
              <select
                name="clientId"
                required
                defaultValue={clientId ?? ""}
                className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2.5 text-sm text-dash-text outline-none ring-[#2d5a87]/30 focus:ring-2"
              >
                <option value="" disabled>
                  Choisir un client…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} — {c.email}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-dash-border pt-5">
            <QuoteValidityField defaultValue={validUntilDefault} />
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-dash-text">Prestations</h2>
            <p className="mt-1 text-xs text-dash-muted">
              Catalogue, TJM ou créneau horaire.
            </p>
          </div>
          <LinesEditor />
        </Panel>

        <Panel>
          <TextArea label="Notes (optionnel)" name="notes" rows={2} />
        </Panel>

        <div className="flex flex-wrap items-center justify-end gap-3 pb-8">
          <Link
            href={dashboardHref(dashboardSlug, "quotes")}
            className="rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft transition hover:bg-dash-hover"
          >
            Annuler
          </Link>
          <PrimaryButton>Créer le devis</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
