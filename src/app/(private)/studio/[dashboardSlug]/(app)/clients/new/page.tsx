import { redirect } from "next/navigation";
import { createClientAction } from "@/app/(private)/actions";
import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function NewClientPage({ params }: Props) {
  const { dashboardSlug } = await params;

  async function action(formData: FormData) {
    "use server";
    const result = await createClientAction(formData);
    if (result.ok) {
      redirect(dashboardHref(dashboardSlug, `clients/${result.id}`));
    }
  }

  return (
    <div>
      <PageHeader
        title="Nouveau client"
        description="Identité et adresse de facturation."
      />
      <Panel className="max-w-2xl">
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" name="name" required />
          <Field label="E-mail" name="email" type="email" required />
          <Field label="Téléphone" name="phone" />
          <Field label="Société" name="companyName" />
          <div className="sm:col-span-2">
            <Field label="Adresse" name="billingAddress" />
          </div>
          <Field label="Code postal" name="billingPostalCode" />
          <Field label="Ville" name="billingCity" />
          <Field label="Pays (ISO)" name="billingCountry" defaultValue="FR" />
          <div className="sm:col-span-2">
            <TextArea label="Notes internes" name="notes" />
          </div>
          <label className="flex items-center gap-2 text-sm text-dash-soft">
            <input
              type="checkbox"
              name="consentContract"
              defaultChecked
              className="rounded border-white/20"
            />
            Consentement contrat
          </label>
          <label className="flex items-center gap-2 text-sm text-dash-soft">
            <input
              type="checkbox"
              name="consentMarketing"
              className="rounded border-white/20"
            />
            Consentement marketing
          </label>
          <div className="sm:col-span-2">
            <PrimaryButton>Enregistrer</PrimaryButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
