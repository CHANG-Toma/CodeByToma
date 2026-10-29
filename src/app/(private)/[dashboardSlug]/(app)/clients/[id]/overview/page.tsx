import { updateClientAction } from "@/app/(private)/actions";
import { CreateClientAccessForm } from "@/components/dashboard/CreateClientAccessForm";
import {
  Field,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { getClient } from "@/server/application/clients";
import { getClientPortalAccess } from "@/server/application/client-access";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientOverviewPage({ params }: Props) {
  const { id } = await params;
  const client = await getClient(id);
  const access = await getClientPortalAccess(id);

  async function save(formData: FormData) {
    "use server";
    await updateClientAction(id, formData);
  }

  return (
    <div className="space-y-6">
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

      <Panel className="max-w-3xl">
        <h2 className="mb-1 text-sm font-medium text-dash-text">
          Accès espace client
        </h2>
        <p className="mb-4 text-sm text-dash-muted">
          Le client se connecte sur /connexion puis est redirigé vers /espace.
        </p>
        {access ? (
          <div className="rounded-md border border-dash-border bg-dash-hover/40 px-4 py-3 text-sm">
            <p className="text-dash-text">
              Accès actif · <span className="font-medium">{access.email}</span>
            </p>
            <p className="mt-1 text-xs text-dash-muted">
              Pour changer le mot de passe, contactez le support technique
              (reset à venir).
            </p>
          </div>
        ) : (
          <CreateClientAccessForm
            clientId={id}
            defaultEmail={client.email}
            defaultName={client.name}
          />
        )}
      </Panel>
    </div>
  );
}
