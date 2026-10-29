import { redirect } from "next/navigation";
import { createQuoteAction } from "@/app/(private)/actions";
import { LinesEditor } from "@/components/dashboard/LinesEditor";
import {
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { listClients } from "@/server/application/clients";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ clientId?: string }>;
};

export default async function NewQuotePage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { clientId } = await searchParams;
  const clients = await listClients();

  async function action(formData: FormData) {
    "use server";
    const result = await createQuoteAction(formData);
    if (result.ok) {
      redirect(dashboardHref(dashboardSlug, `quotes/${result.id}`));
    }
  }

  return (
    <div>
      <PageHeader title="Nouveau devis" description="Lignes et totaux recalculés serveur." />
      <Panel className="max-w-3xl space-y-4">
        <form action={action} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[#8fa0b5]">Client</span>
            <select
              name="clientId"
              required
              defaultValue={clientId ?? ""}
              className="w-full rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white"
            >
              <option value="" disabled>
                Choisir…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.name} — {c.email}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[#8fa0b5]">Valide jusqu&apos;au</span>
            <input
              type="date"
              name="validUntil"
              className="rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white"
            />
          </label>
          <TextArea label="Notes" name="notes" />
          <div>
            <p className="mb-2 text-sm text-[#8fa0b5]">Lignes</p>
            <LinesEditor />
          </div>
          <PrimaryButton>Créer le devis</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
