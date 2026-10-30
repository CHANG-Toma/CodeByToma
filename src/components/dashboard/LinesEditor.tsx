"use client";

import { useMemo, useState } from "react";
import { calculateDocumentTotals } from "@/lib/document-totals";
import { formatEur } from "@/lib/money";
import {
  lineFromFullDay,
  lineFromHalfDay,
  lineFromHours,
  lineFromSlot,
  priceFromHours,
  priceFromSlot,
} from "@/lib/tjm-pricing";
import {
  HOSTING_FEE_CENTS,
  SETUP_FEE_CENTS,
  TJM_FEE_CENTS,
} from "@/data/fees";

export type LineDraft = {
  label: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRatePercent: number;
};

type Props = {
  name?: string;
  initialLines?: LineDraft[];
  /** Tarifs opérationnels (catalogue). Fallback = fees.ts */
  setupCents?: number;
  hostingCents?: number;
  tjmCents?: number;
};

type SlotMode = "slot" | "hours";

const EMPTY_START: LineDraft[] = [];

export function LinesEditor({
  name = "linesJson",
  initialLines,
  setupCents = SETUP_FEE_CENTS,
  hostingCents = HOSTING_FEE_CENTS,
  tjmCents = TJM_FEE_CENTS,
}: Props) {
  const [lines, setLines] = useState<LineDraft[]>(
    initialLines ?? EMPTY_START,
  );

  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("12:00");
  const [hoursInput, setHoursInput] = useState("3");
  const [mode, setMode] = useState<SlotMode>("slot");
  const [calcError, setCalcError] = useState<string | null>(null);

  const tjmEur = tjmCents / 100;
  const presets = useMemo(
    () => [
      { label: "Création du site", unitPriceHtCents: setupCents },
      { label: "Hébergement — 1 mois", unitPriceHtCents: hostingCents },
      { label: "Prestation TJM — 1 jour", unitPriceHtCents: tjmCents },
      {
        label: "Prestation TJM — ½ jour",
        unitPriceHtCents: Math.round(tjmCents / 2),
      },
    ],
    [setupCents, hostingCents, tjmCents],
  );

  const totals = useMemo(() => calculateDocumentTotals(lines), [lines]);

  const preview = useMemo(() => {
    try {
      if (mode === "slot") {
        const result = priceFromSlot(slotStart, slotEnd, tjmCents);
        return { ok: true as const, ...result };
      }
      const hours = Number(String(hoursInput).replace(",", "."));
      return {
        ok: true as const,
        hours,
        priceCents: priceFromHours(hours, tjmCents),
      };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Créneau invalide",
      };
    }
  }, [mode, slotStart, slotEnd, hoursInput, tjmCents]);

  function update(index: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addLine(line: LineDraft) {
    setCalcError(null);
    setLines((prev) => [...prev, line]);
  }

  function addCustomTjm() {
    try {
      if (mode === "slot") {
        addLine(lineFromSlot(slotStart, slotEnd, tjmCents));
      } else {
        const hours = Number(String(hoursInput).replace(",", "."));
        addLine(lineFromHours(hours, tjmCents));
      }
    } catch (e) {
      setCalcError(e instanceof Error ? e.message : "Créneau invalide");
    }
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(lines)} />

      <div className="space-y-3 rounded-md border border-dash-border bg-dash-hover/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-dash-text">TJM</p>
          <p className="text-xs text-dash-muted">{tjmEur} € / jour</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-dash-border px-2 py-1 text-xs text-dash-soft hover:bg-dash-hover"
            onClick={() => addLine(lineFromFullDay(tjmCents))}
          >
            1 jour
          </button>
          <button
            type="button"
            className="rounded border border-dash-border px-2 py-1 text-xs text-dash-soft hover:bg-dash-hover"
            onClick={() => addLine(lineFromHalfDay(tjmCents))}
          >
            ½ jour
          </button>
          <button
            type="button"
            className="rounded border border-dash-border px-2 py-1 text-xs text-dash-soft hover:bg-dash-hover"
            onClick={() => addLine(lineFromSlot(9, 12, tjmCents))}
          >
            Matin 9–12
          </button>
          <button
            type="button"
            className="rounded border border-dash-border px-2 py-1 text-xs text-dash-soft hover:bg-dash-hover"
            onClick={() => addLine(lineFromSlot(14, 18, tjmCents))}
          >
            Après-midi 14–18
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            className={
              mode === "slot"
                ? "text-dash-text underline"
                : "text-dash-muted hover:text-dash-soft"
            }
            onClick={() => setMode("slot")}
          >
            Créneau
          </button>
          <span className="text-dash-muted2">·</span>
          <button
            type="button"
            className={
              mode === "hours"
                ? "text-dash-text underline"
                : "text-dash-muted hover:text-dash-soft"
            }
            onClick={() => setMode("hours")}
          >
            Heures
          </button>
        </div>

        {mode === "slot" ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-dash-muted">
              Début
              <input
                type="time"
                value={slotStart}
                onChange={(e) => setSlotStart(e.target.value)}
                className="mt-1 block rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text"
              />
            </label>
            <label className="text-xs text-dash-muted">
              Fin
              <input
                type="time"
                value={slotEnd}
                onChange={(e) => setSlotEnd(e.target.value)}
                className="mt-1 block rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text"
              />
            </label>
            <button
              type="button"
              onClick={addCustomTjm}
              className="rounded-md border border-dash-border px-3 py-1.5 text-xs text-dash-soft hover:bg-dash-hover"
            >
              Ajouter la ligne
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-dash-muted">
              Nombre d’heures
              <input
                type="number"
                min={0.25}
                step={0.25}
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                className="mt-1 block w-28 rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text"
              />
            </label>
            <button
              type="button"
              onClick={addCustomTjm}
              className="rounded-md border border-dash-border px-3 py-1.5 text-xs text-dash-soft hover:bg-dash-hover"
            >
              Ajouter la ligne
            </button>
          </div>
        )}

        {preview.ok ? (
          <p className="text-xs text-dash-muted">
            Aperçu : {formatEur(preview.priceCents)}
            {preview.hours != null ? ` · ${preview.hours} h` : null}
          </p>
        ) : (
          <p className="text-xs text-rose-600 dark:text-rose-300">
            {preview.message}
          </p>
        )}
        {calcError ? (
          <p className="text-xs text-rose-600 dark:text-rose-300">{calcError}</p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs text-dash-muted">Catalogue</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="rounded-md border border-dash-border px-2.5 py-1.5 text-xs text-dash-soft transition hover:bg-dash-hover"
              onClick={() =>
                setLines((prev) => [
                  ...prev,
                  {
                    label: p.label,
                    quantity: 1,
                    unitPriceHtCents: p.unitPriceHtCents,
                    taxRatePercent: 0,
                  },
                ])
              }
            >
              + {p.label.split("—")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-md border border-dashed border-dash-border px-4 py-8 text-center text-sm text-dash-muted">
          Aucune ligne — choisis un preset ou un créneau TJM.
        </p>
      ) : null}

      {lines.map((line, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-md border border-dash-border p-3 sm:grid-cols-12"
        >
          <input
            className="rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text sm:col-span-5"
            value={line.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Libellé"
          />
          <input
            type="number"
            min={0.01}
            step={0.01}
            className="rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text sm:col-span-2"
            value={line.quantity}
            onChange={(e) =>
              update(index, { quantity: Number(e.target.value) || 0 })
            }
            placeholder="Qté"
          />
          <input
            type="number"
            min={0}
            step={0.01}
            className="rounded-md border border-dash-border bg-dash-input px-2 py-1.5 text-sm text-dash-text sm:col-span-3"
            value={(line.unitPriceHtCents / 100).toFixed(2)}
            onChange={(e) =>
              update(index, {
                unitPriceHtCents: Math.round(
                  (Number(e.target.value) || 0) * 100,
                ),
              })
            }
            placeholder="P.U. HT €"
          />
          <button
            type="button"
            className="text-xs text-rose-600 dark:text-rose-300 sm:col-span-2"
            onClick={() =>
              setLines((prev) => prev.filter((_, i) => i !== index))
            }
          >
            Retirer
          </button>
        </div>
      ))}

      {lines.length > 0 ? (
        <div className="flex justify-end border-t border-dash-border pt-4">
          <div className="min-w-[10rem] space-y-1 text-right text-sm">
            <div className="flex justify-between gap-8 text-dash-soft">
              <span>HT</span>
              <span>{formatEur(totals.subtotalCents)}</span>
            </div>
            <div className="flex justify-between gap-8 text-dash-soft">
              <span>TVA</span>
              <span>{formatEur(totals.taxCents)}</span>
            </div>
            <div className="flex justify-between gap-8 text-base font-medium text-dash-text">
              <span>TTC</span>
              <span>{formatEur(totals.totalCents)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
