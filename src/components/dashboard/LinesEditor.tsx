"use client";

import { useMemo, useState } from "react";
import { calculateDocumentTotals } from "@/lib/document-totals";
import { formatEur } from "@/lib/money";
import {
  HOSTING_FEE_CENTS,
  SETUP_FEE_CENTS,
  TJM_FEE_CENTS,
  TJM_HALF_DAY_CENTS,
} from "@/data/fees";

export type LineDraft = {
  label: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRatePercent: number;
};

const PRESETS: Array<{ label: string; unitPriceHtCents: number }> = [
  { label: "Création du site", unitPriceHtCents: SETUP_FEE_CENTS },
  { label: "Hébergement — 1 mois", unitPriceHtCents: HOSTING_FEE_CENTS },
  { label: "Prestation TJM — 1 jour", unitPriceHtCents: TJM_FEE_CENTS },
  { label: "Prestation TJM — ½ jour", unitPriceHtCents: TJM_HALF_DAY_CENTS },
];

type Props = {
  name?: string;
  initialLines?: LineDraft[];
};

export function LinesEditor({
  name = "linesJson",
  initialLines,
}: Props) {
  const [lines, setLines] = useState<LineDraft[]>(
    initialLines?.length
      ? initialLines
      : [
          {
            label: "Création du site",
            quantity: 1,
            unitPriceHtCents: SETUP_FEE_CENTS,
            taxRatePercent: 0,
          },
        ],
  );

  const totals = useMemo(() => calculateDocumentTotals(lines), [lines]);

  function update(index: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(lines)} />
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="rounded border border-dash-border px-2 py-1 text-xs text-dash-soft hover:bg-dash-hover"
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

      <div className="text-right text-sm text-dash-soft">
        <p>HT : {formatEur(totals.subtotalCents)}</p>
        <p>TVA : {formatEur(totals.taxCents)}</p>
        <p className="font-medium text-dash-text">
          TTC : {formatEur(totals.totalCents)}
        </p>
      </div>
    </div>
  );
}
