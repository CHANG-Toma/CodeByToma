"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Radar, Sparkles, X } from "lucide-react";
import { dashboardHref } from "@/lib/dashboard-href";
import type { NoriSummary } from "@/server/application/nori-summary";

type Props = {
  slug: string;
  summary: NoriSummary;
};

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

export function NoriPresence({ slug, summary }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const generationDate = summary.latestGeneration
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(summary.latestGeneration))
    : null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
    >
      {open ? (
        <div
          id="nori-summary"
          role="dialog"
          aria-labelledby="nori-summary-title"
          className="nori-popover w-[min(21rem,calc(100vw-2.5rem))] rounded-xl border border-dash-border bg-dash-sidebar/95 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" aria-hidden />
                <h2
                  id="nori-summary-title"
                  className="font-medium text-dash-text"
                >
                  Point rapide de Nori
                </h2>
              </div>
              <p className="mt-1 text-xs text-dash-muted">
                Les dernières informations déjà présentes dans ton espace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-dash-muted transition hover:bg-dash-hover hover:text-dash-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn"
              aria-label="Fermer le point rapide"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2">
            <SummaryStat label="Veille" value={summary.veilleItems} />
            <SummaryStat label="Prospects" value={summary.prospectItems} />
            <SummaryStat label="À faire" value={summary.todayActions} />
          </dl>

          <p className="mt-3 text-xs text-dash-muted">
            {generationDate
              ? `Dernière génération le ${generationDate}`
              : "Aucun lot généré pour le moment"}
          </p>

          <Link
            href={dashboardHref(slug, "opportunites")}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-dash-border bg-dash-hover px-3 py-2 text-sm font-medium text-dash-soft transition hover:-translate-y-0.5 hover:border-sky-500/30 hover:text-dash-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn motion-reduce:transform-none"
          >
            <Radar className="h-4 w-4" aria-hidden />
            Voir la veille et les prospects
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="nori-summary"
        className="nori-orb group relative flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/25 bg-dash-sidebar shadow-lg shadow-sky-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dash-bg"
      >
        <span className="sr-only">
          {open ? "Fermer Nori" : "Ouvrir le point rapide de Nori"}
        </span>
        <span
          className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(186,230,253,.95),rgba(56,189,248,.5)_30%,rgba(45,90,135,.8)_65%,rgba(8,12,17,.9))]"
          aria-hidden
        />
        <span
          className="absolute inset-[3px] rounded-full ring-1 ring-inset ring-white/20"
          aria-hidden
        />
        <span className="relative text-[9px] font-semibold tracking-wide text-white drop-shadow">
          Nori
        </span>
      </button>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-dash-border bg-dash-input/60 px-2 py-2.5 text-center">
      <dd
        className="text-lg font-semibold tabular-nums text-dash-text"
        aria-label={plural(value, "élément", "éléments")}
      >
        {value}
      </dd>
      <dt className="mt-0.5 text-[10px] uppercase tracking-wide text-dash-muted">
        {label}
      </dt>
    </div>
  );
}
