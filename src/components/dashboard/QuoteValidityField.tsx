"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addYears,
  defaultQuoteValidUntil,
  toDateInputValue,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

type Preset = {
  id: string;
  label: string;
  value: string;
};

type Props = {
  name?: string;
  defaultValue?: string;
};

function buildPresets(from: Date): Preset[] {
  return [
    {
      id: "30d",
      label: "30 jours",
      value: toDateInputValue(addDays(from, 30)),
    },
    {
      id: "90d",
      label: "3 mois",
      value: toDateInputValue(addDays(from, 90)),
    },
    {
      id: "1y",
      label: "1 an",
      value: toDateInputValue(addYears(from, 1)),
    },
  ];
}

export function QuoteValidityField({
  name = "validUntil",
  defaultValue,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const presets = useMemo(() => buildPresets(today), [today]);
  const initial = defaultValue ?? defaultQuoteValidUntil(today);
  const [value, setValue] = useState(initial);

  const activePreset = presets.find((p) => p.value === value)?.id ?? null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-dash-muted">Valide jusqu’au</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setValue(p.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition",
                activePreset === p.id
                  ? "bg-dash-btn text-dash-on-btn"
                  : "border border-dash-border text-dash-soft hover:bg-dash-hover",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <input
        type="date"
        name={name}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text outline-none ring-[#2d5a87]/30 focus:ring-2 sm:max-w-xs"
      />
    </div>
  );
}
