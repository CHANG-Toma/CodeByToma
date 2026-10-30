import type { CSSProperties } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import {
  dismissAssistantItemAction,
  markAssistantItemUsedAction,
} from "@/app/(private)/actions";
import { AssistantDraftPanel } from "@/components/dashboard/AssistantDraftPanel";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { getProspectSignal } from "@/lib/assistant-presentation";
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
        batches.map((batch, batchIndex) => (
          <Panel
            key={batch.id}
            className="nori-batch-card space-y-4"
            style={
              { "--nori-index": Math.min(batchIndex, 8) } as CSSProperties
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
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
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-2.5 py-1 text-[11px] text-dash-muted">
                <span
                  className="nori-status-dot h-1.5 w-1.5 rounded-full bg-sky-400"
                  aria-hidden
                />
                <Sparkles className="h-3 w-3 text-sky-400" aria-hidden />
                <span>Généré par Nori</span>
                <span aria-hidden>·</span>
                <time dateTime={batch.createdAt.toISOString()}>
                  {batch.createdAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </div>

            {batch.items.length === 0 ? (
              <p className="text-sm text-dash-muted">
                Tous les éléments de ce lot étaient déjà connus (doublons
                ignorés).
              </p>
            ) : (
              <ul className="grid gap-3">
                {batch.items.map((item, itemIndex) => {
                  const prospectSignal =
                    batch.kind === "prospection"
                      ? getProspectSignal(item)
                      : null;

                  return (
                  <li
                    key={item.id}
                    className="nori-item-card space-y-3 rounded-lg border border-dash-border bg-dash-input/25 px-4 py-4"
                    style={
                      {
                        "--nori-index": Math.min(
                          batchIndex * 2 + itemIndex + 1,
                          10,
                        ),
                      } as CSSProperties
                    }
                  >
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
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs text-dash-muted transition hover:text-dash-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn"
                          >
                            Source
                            <ExternalLink className="h-3 w-3" aria-hidden />
                          </a>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {prospectSignal ? (
                          <StatusBadge
                            label={prospectSignal.label}
                            tone={prospectSignal.tone}
                          />
                        ) : null}
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
                    </div>

                    {item.draftEmailSubject || item.draftEmailBody ? (
                      <AssistantDraftPanel
                        subject={item.draftEmailSubject}
                        body={item.draftEmailBody}
                      />
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
                  );
                })}
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
          ? "rounded-md bg-dash-active px-3 py-1.5 text-dash-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn"
          : "rounded-md border border-dash-border px-3 py-1.5 text-dash-muted transition hover:-translate-y-0.5 hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn motion-reduce:transform-none"
      }
      aria-current={active ? "page" : undefined}
    >
      {label}
    </a>
  );
}
