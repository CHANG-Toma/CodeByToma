import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
} from "@/components/dashboard/ui";
import { updatePortalProfileAction } from "@/app/(private)/actions";
import { getClient } from "@/server/application/clients";
import { requireClient } from "@/server/infrastructure/auth/session";

export default async function EspaceProfilPage() {
  const session = await requireClient();
  const client = await getClient(session.clientId);

  async function save(formData: FormData) {
    "use server";
    await updatePortalProfileAction(formData);
  }

  return (
    <div>
      <PageHeader
        title="Mon profil"
        description="Coordonnées utilisées pour la facturation et les échanges."
      />

      <Panel className="max-w-3xl">
        <form action={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" name="name" required defaultValue={client.name} />
          <Field
            label="E-mail"
            name="email"
            type="email"
            required
            defaultValue={client.email}
          />
          <Field
            label="Téléphone"
            name="phone"
            defaultValue={client.phone ?? ""}
          />
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
          <label className="flex items-center gap-2 text-sm text-dash-soft sm:col-span-2">
            <input
              type="checkbox"
              name="consentMarketing"
              defaultChecked={client.consentMarketing}
            />
            J’accepte de recevoir des informations utiles sur mon site /
            maintenance
          </label>
          <input type="hidden" name="consentContract" value="on" />
          <div className="sm:col-span-2">
            <PrimaryButton>Enregistrer</PrimaryButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
