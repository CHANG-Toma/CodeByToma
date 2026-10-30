import { redirect } from "next/navigation";
import { createInvoiceAction } from "@/app/(private)/actions";
import { LinesEditor } from "@/components/dashboard/LinesEditor";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { clientInvoiceHref } from "@/lib/dashboard-href";
import { listClients } from "@/server/application/clients";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewInvoicePage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { clientId } = await searchParams;
  const clients = await listClients();

  async function action(formData: FormData) {
    "use server";
    const result = await createInvoiceAction(formData);
    if (result.ok) {
      redirect(clientInvoiceHref(dashboardSlug, result.clientId, result.id));
    }
  }

  return (
    <div>
      <PageHeader
        title="Nouvelle facture"
        description="Numérotation séquentielle automatique à l'émission."
      />
      <Panel className="max-w-3xl">
        <form action={action} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-dash-muted">Client</span>
            <select
              name="clientId"
              required
              className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
              defaultValue={clientId ?? ""}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.name}
                </option>
              ))}
            </select>
          </label>
          <TextArea label="Notes" name="notes" />
          <LinesEditor />
          <PrimaryButton>Émettre la facture</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
