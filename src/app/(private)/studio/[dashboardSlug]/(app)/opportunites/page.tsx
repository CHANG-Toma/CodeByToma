import {
  dismissAssistantItemAction,
  markAssistantItemUsedAction,
} from "@/app/(private)/actions";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { listAssistantBatches } from "@/server/application/assistant";
import { requireAdmin } from "@/server/infrastructure/auth/session";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ kind?: string }>;
};

export default async function OpportunitesPage({
  params,
  searchParams,
}: Props) {
  await requireAdmin();
  await params;
  const { kind } = await searchParams;
  const filterKind =
    kind === "veille" || kind === "prospection" ? kind : undefined;
  const batches = await listAssistantBatches(
    filterKind ? { kind: filterKind } : undefined,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Veille & prospection"
        description="Contenus déposés par l’assistant (Nori). Tu valides et tu envoies toi-même."
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip href="?" active={!filterKind} label="Tout" />
        <FilterChip
          href="?kind=veille"
          active={filterKind === "veille"}
          label="Veille"
        />
        <FilterChip
          href="?kind=prospection"
          active={filterKind === "prospection"}
          label="Prospection"
        />
      </div>

      {batches.length === 0 ? (
        <EmptyState
          title="Rien pour le moment"
          description="Les routines hebdo et prospection apparaîtront ici dès qu’elles auront déposé un lot."
        />
      ) : (
        batches.map((batch) => (
          <Panel key={batch.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={batch.kind === "veille" ? "Veille" : "Prospection"}
                tone={batch.kind === "veille" ? "info" : "ok"}
              />
              <h2 className="text-sm font-medium text-dash-text">
                {batch.title ??
                  (batch.kind === "veille"
                    ? "Veille hebdomadaire"
                    : "Prospection")}
              </h2>
              {batch.periodLabel ? (
                <span className="text-xs text-dash-muted">
                  {batch.periodLabel}
                </span>
              ) : null}
              <span className="text-xs text-dash-muted2">
                {batch.createdAt.toLocaleString("fr-FR")}
              </span>
            </div>

            {batch.items.length === 0 ? (
              <p className="text-sm text-dash-muted">
                Tous les éléments de ce lot étaient déjà connus (doublons
                ignorés).
              </p>
            ) : (
              <ul className="divide-y divide-dash-border rounded-md border border-dash-border">
                {batch.items.map((item) => (
                  <li key={item.id} className="space-y-3 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-dash-text">
                          {item.title}
                        </p>
                        {item.detail ? (
                          <p className="mt-1 text-sm text-dash-soft">
                            {item.detail}
                          </p>
                        ) : null}
                        {item.summary ? (
                          <p className="mt-1 text-sm text-dash-muted">
                            {item.summary}
                          </p>
                        ) : null}
                        {item.commercialAction ? (
                          <p className="mt-2 text-xs text-dash-soft">
                            Action : {item.commercialAction}
                          </p>
                        ) : null}
                        {item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs text-dash-muted hover:underline"
                          >
                            Source
                          </a>
                        ) : null}
                      </div>
                      <StatusBadge
                        label={
                          item.status === "new"
                            ? "Nouveau"
                            : item.status === "used"
                              ? "Utilisé"
                              : "Ignoré"
                        }
                        tone={
                          item.status === "new"
                            ? "info"
                            : item.status === "used"
                              ? "ok"
                              : "neutral"
                        }
                      />
                    </div>

                    {item.draftEmailSubject || item.draftEmailBody ? (
                      <div className="rounded-md border border-dash-border bg-dash-input/40 px-3 py-3 text-sm">
                        {item.draftEmailSubject ? (
                          <p className="font-medium text-dash-text">
                            Objet : {item.draftEmailSubject}
                          </p>
                        ) : null}
                        {item.draftEmailBody ? (
                          <pre className="mt-2 whitespace-pre-wrap font-sans text-dash-soft">
                            {item.draftEmailBody}
                          </pre>
                        ) : null}
                        {item.draftEmailSubject && item.draftEmailBody ? (
                          <a
                            href={`mailto:?subject=${encodeURIComponent(item.draftEmailSubject)}&body=${encodeURIComponent(item.draftEmailBody)}`}
                            className="mt-3 inline-flex text-xs text-dash-soft underline"
                          >
                            Ouvrir dans la messagerie
                          </a>
                        ) : null}
                      </div>
                    ) : null}

                    {item.status === "new" ? (
                      <div className="flex flex-wrap gap-2">
                        <form action={markAssistantItemUsedAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <PrimaryButton>Marquer utilisé</PrimaryButton>
                        </form>
                        <form action={dismissAssistantItemAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <SecondaryButton>Ignorer</SecondaryButton>
                        </form>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ))
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={
        active
          ? "rounded-md bg-dash-active px-3 py-1.5 text-dash-text"
          : "rounded-md border border-dash-border px-3 py-1.5 text-dash-muted hover:bg-dash-hover"
      }
    >
      {label}
    </a>
  );
}
