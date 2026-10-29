"use client";

import { useMemo, useState } from "react";
import { calculateDocumentTotals } from "@/server/domain/totals";
import { formatEur } from "@/server/domain/money";

export type LineDraft = {
  label: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRatePercent: number;
};

const PRESETS: Array<{ label: string; unitPriceHtCents: number }> = [
  { label: "Création du site", unitPriceHtCents: 14900 },
  { label: "Abonnement Essentiel — 1 mois", unitPriceHtCents: 4900 },
  { label: "Abonnement Sérénité — 1 mois", unitPriceHtCents: 6500 },
  { label: "Abonnement Premium — 1 mois", unitPriceHtCents: 15900 },
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
      : [{ label: "Création du site", quantity: 1, unitPriceHtCents: 14900, taxRatePercent: 0 }],
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
            className="rounded border border-white/10 px-2 py-1 text-xs text-[#c5d0de] hover:bg-white/5"
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
          className="grid gap-2 rounded-md border border-white/10 p-3 sm:grid-cols-12"
        >
          <input
            className="sm:col-span-5 rounded-md border border-white/10 bg-[#0e141c] px-2 py-1.5 text-sm text-white"
            value={line.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Libellé"
          />
          <input
            type="number"
            min={0.01}
            step={0.01}
            className="sm:col-span-2 rounded-md border border-white/10 bg-[#0e141c] px-2 py-1.5 text-sm text-white"
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
            className="sm:col-span-3 rounded-md border border-white/10 bg-[#0e141c] px-2 py-1.5 text-sm text-white"
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
            className="sm:col-span-2 text-xs text-rose-300"
            onClick={() =>
              setLines((prev) => prev.filter((_, i) => i !== index))
            }
          >
            Retirer
          </button>
        </div>
      ))}

      <div className="text-right text-sm text-[#c5d0de]">
        <p>HT : {formatEur(totals.subtotalCents)}</p>
        <p>TVA : {formatEur(totals.taxCents)}</p>
        <p className="font-medium text-white">
          TTC : {formatEur(totals.totalCents)}
        </p>
      </div>
    </div>
  );
}
