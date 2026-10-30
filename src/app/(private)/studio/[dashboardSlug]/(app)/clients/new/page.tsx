import { redirect } from "next/navigation";
import { createClientAction } from "@/app/(private)/actions";
import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  TextArea,
} from "@/components/dashboard/ui";
import { dashboardHref } from "@/lib/dashboard-href";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function NewClientPage({ params }: Props) {
  const { dashboardSlug } = await params;

  async function action(formData: FormData) {
    "use server";
    const result = await createClientAction(formData);
    if (result.ok) {
      redirect(
        dashboardHref(dashboardSlug, `quotes/new?clientId=${result.id}`),
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Nouveau client" />

      <form action={action} className="space-y-6">
        <Panel className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" name="name" required />
            <Field label="E-mail" name="email" type="email" required />
            <Field
              label="Téléphone"
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={40}
              autoComplete="tel-national"
              placeholder="0612345678"
            />
            <Field label="Société" name="companyName" />
            <Field label="Pays" name="billingCountry" defaultValue="FR" />
          </div>
        </Panel>

        <details className="rounded-lg border border-dash-border bg-dash-surface">
          <summary className="cursor-pointer list-none px-5 py-3.5 text-sm text-dash-soft marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Adresse de facturation
              <span className="text-xs text-dash-muted2">optionnel</span>
            </span>
          </summary>
          <div className="grid gap-4 border-t border-dash-border px-5 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Adresse" name="billingAddress" />
            </div>
            <Field label="Code postal" name="billingPostalCode" />
            <Field label="Ville" name="billingCity" />
          </div>
        </details>

        <details className="rounded-lg border border-dash-border bg-dash-surface">
          <summary className="cursor-pointer list-none px-5 py-3.5 text-sm text-dash-soft marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Notes
              <span className="text-xs text-dash-muted2">optionnel</span>
            </span>
          </summary>
          <div className="border-t border-dash-border px-5 py-4">
            <TextArea label="Notes internes" name="notes" rows={2} />
          </div>
        </details>

        <div className="flex flex-wrap gap-x-6 gap-y-2 px-1">
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
        </div>

        <div className="flex justify-end pb-8">
          <PrimaryButton>Enregistrer</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
