import {
  updateAdminFeesAction,
  updateAdminProfileAction,
  updateAdminRevenueGoalAction,
} from "@/app/(private)/actions";
import {
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
} from "@/components/dashboard/ui";
import { formatEur } from "@/lib/money";
import { getAdminSettings } from "@/server/application/settings";
import { requireAdmin } from "@/server/infrastructure/auth/session";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
};

export default async function ProfilPage({ params }: Props) {
  await params;
  const session = await requireAdmin();
  const settings = await getAdminSettings(session.sub);

  async function saveProfile(formData: FormData) {
    "use server";
    await updateAdminProfileAction(formData);
  }

  async function saveFees(formData: FormData) {
    "use server";
    await updateAdminFeesAction(formData);
  }

  async function saveRevenueGoal(formData: FormData) {
    "use server";
    await updateAdminRevenueGoalAction(formData);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Mon profil"
        description="Infos du compte et tarifs utilisés dans les devis."
      />

      <Panel>
        <h2 className="mb-4 text-sm font-medium text-dash-text">Mes infos</h2>
        <form action={saveProfile} className="space-y-4">
          <Field
            label="Nom affiché"
            name="name"
            defaultValue={settings.user.name ?? ""}
            placeholder="Toma Chang"
          />
          <label className="block text-sm">
            <span className="mb-1.5 block text-dash-muted">E-mail</span>
            <input
              value={settings.user.email}
              disabled
              className="w-full rounded-md border border-dash-border bg-dash-input/60 px-3 py-2 text-sm text-dash-muted"
            />
            <span className="mt-1 block text-xs text-dash-muted2">
              L’e-mail de connexion ne se modifie pas ici.
            </span>
          </label>
          <PrimaryButton>Enregistrer le profil</PrimaryButton>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-1 text-sm font-medium text-dash-text">
          Objectif de CA (mois)
        </h2>
        <p className="mb-4 text-xs text-dash-muted">
          Affiché sur l’accueil à côté du CA encaissé. Laisse vide pour masquer
          la barre de progression.
        </p>
        <form action={saveRevenueGoal} className="flex flex-wrap items-end gap-4">
          <Field
            label="Objectif (€)"
            name="goalEuros"
            type="number"
            step="1"
            min="0"
            placeholder="ex. 5000"
            defaultValue={
              settings.monthlyRevenueGoalCents != null
                ? String(settings.monthlyRevenueGoalCents / 100)
                : ""
            }
          />
          <PrimaryButton>Enregistrer l’objectif</PrimaryButton>
        </form>
      </Panel>

      <Panel id="tarifs">
        <h2 className="mb-1 text-sm font-medium text-dash-text">
          Tarifs & TJM
        </h2>
        <p className="mb-4 text-xs text-dash-muted">
          Une seule source : site public, devis et catalogue. Tout se met à jour
          dès l’enregistrement.
        </p>
        <form action={saveFees} className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Création (€)"
            name="setupEuros"
            type="number"
            step="1"
            min="1"
            required
            defaultValue={(settings.fees.setupCents / 100).toFixed(0)}
          />
          <Field
            label="Hébergement (€/mois)"
            name="hostingEuros"
            type="number"
            step="1"
            min="1"
            required
            defaultValue={(settings.fees.hostingCents / 100).toFixed(0)}
          />
          <Field
            label="TJM (€/jour)"
            name="tjmEuros"
            type="number"
            step="1"
            min="1"
            required
            defaultValue={(settings.fees.tjmCents / 100).toFixed(0)}
          />
          <div className="sm:col-span-3">
            <p className="mb-3 text-xs text-dash-muted">
              Actuel : création {formatEur(settings.fees.setupCents)} ·
              hébergement {formatEur(settings.fees.hostingCents)}/mois · TJM{" "}
              {formatEur(settings.fees.tjmCents)}/jour
            </p>
            <PrimaryButton>Enregistrer les tarifs</PrimaryButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
