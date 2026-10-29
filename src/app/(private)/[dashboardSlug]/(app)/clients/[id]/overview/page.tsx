import { updateClientAction } from "@/app/(private)/actions";
import {
  Field,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { getClient } from "@/server/application/clients";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientOverviewPage({ params }: Props) {
  const { id } = await params;
  const client = await getClient(id);

  async function save(formData: FormData) {
    "use server";
    await updateClientAction(id, formData);
  }

  return (
    <Panel className="max-w-3xl">
      <h2 className="mb-4 text-sm font-medium text-dash-text">Fiche client</h2>
      <form action={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" name="name" required defaultValue={client.name} />
        <Field
          label="E-mail"
          name="email"
          type="email"
          required
          defaultValue={client.email}
        />
        <Field label="Téléphone" name="phone" defaultValue={client.phone ?? ""} />
        <Field
          label="Société"
          name="companyName"
          defaultValue={client.companyName ?? ""}
        />
        <div className="sm:col-span-2">
          <Field
            label="Adresse"
            name="billingAddress"
            defaultValue={client.billingAddress ?? ""}
          />
        </div>
        <Field
          label="Code postal"
          name="billingPostalCode"
          defaultValue={client.billingPostalCode ?? ""}
        />
        <Field
          label="Ville"
          name="billingCity"
          defaultValue={client.billingCity ?? ""}
        />
        <Field
          label="Pays"
          name="billingCountry"
          defaultValue={client.billingCountry}
        />
        <div className="sm:col-span-2">
          <TextArea
            label="Notes"
            name="notes"
            defaultValue={client.notes ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-dash-soft">
          <input
            type="checkbox"
            name="consentContract"
            defaultChecked={client.consentContract}
          />
          Consentement contrat
        </label>
        <label className="flex items-center gap-2 text-sm text-dash-soft">
          <input
            type="checkbox"
            name="consentMarketing"
            defaultChecked={client.consentMarketing}
          />
          Consentement marketing
        </label>
        <div className="sm:col-span-2">
          <PrimaryButton>Enregistrer</PrimaryButton>
        </div>
      </form>
    </Panel>
  );
}
