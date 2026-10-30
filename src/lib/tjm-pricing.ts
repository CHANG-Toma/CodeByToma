import { TJM_FEE_CENTS, TJM_HOURS_PER_DAY } from "@/data/fees";

/** Heure décimale (9.5 = 9h30) ou "HH:MM". */
export type TimeInput = number | string;

export function parseTimeToHours(input: TimeInput): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0 || input >= 24) {
      throw new Error("Heure invalide");
    }
    return input;
  }
  const trimmed = input.trim();
  const match = /^(\d{1,2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) throw new Error("Heure invalide");
  const h = Number(match[1]);
  const m = match[2] ? Number(match[2]) : 0;
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error("Heure invalide");
  }
  return h + m / 60;
}

export function formatHoursFr(hours: number): string {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole} h`;
  if (minutes === 30) return `${whole} h 30`;
  return `${whole} h ${String(minutes).padStart(2, "0")}`;
}

export function formatSlotLabel(startHours: number, endHours: number): string {
  const fmt = (h: number) => {
    const whole = Math.floor(h);
    const minutes = Math.round((h - whole) * 60);
    if (minutes === 0) return `${whole}h`;
    return `${whole}h${String(minutes).padStart(2, "0")}`;
  };
  return `${fmt(startHours)}–${fmt(endHours)}`;
}

export function hoursBetween(start: TimeInput, end: TimeInput): number {
  const from = parseTimeToHours(start);
  const to = parseTimeToHours(end);
  const duration = to - from;
  if (duration <= 0) {
    throw new Error("Le créneau doit se terminer après le début");
  }
  return duration;
}

/** Prorata TJM : montant = TJM × heures / heures_par_jour, arrondi au centime. */
export function priceFromHours(
  hours: number,
  tjmCents: number = TJM_FEE_CENTS,
  hoursPerDay: number = TJM_HOURS_PER_DAY,
): number {
  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("Durée invalide");
  }
  if (hoursPerDay <= 0) {
    throw new Error("Heures par jour invalides");
  }
  return Math.round((tjmCents * hours) / hoursPerDay);
}

export function priceFromSlot(
  start: TimeInput,
  end: TimeInput,
  tjmCents: number = TJM_FEE_CENTS,
  hoursPerDay: number = TJM_HOURS_PER_DAY,
): { hours: number; priceCents: number } {
  const hours = hoursBetween(start, end);
  return {
    hours,
    priceCents: priceFromHours(hours, tjmCents, hoursPerDay),
  };
}

export function priceFullDay(tjmCents: number = TJM_FEE_CENTS): number {
  return tjmCents;
}

export function priceHalfDay(tjmCents: number = TJM_FEE_CENTS): number {
  return Math.round(tjmCents / 2);
}

export function labelFullDay(): string {
  return "Prestation TJM — 1 jour";
}

export function labelHalfDay(): string {
  return "Prestation TJM — ½ jour";
}

export function labelFromHours(hours: number): string {
  return `Prestation TJM — ${formatHoursFr(hours)}`;
}

export function labelFromSlot(start: TimeInput, end: TimeInput): string {
  const from = parseTimeToHours(start);
  const to = parseTimeToHours(end);
  const hours = hoursBetween(start, end);
  return `Prestation TJM — ${formatSlotLabel(from, to)} (${formatHoursFr(hours)})`;
}

export type TjmLineDraft = {
  label: string;
  quantity: number;
  unitPriceHtCents: number;
  taxRatePercent: number;
};

export function lineFromFullDay(): TjmLineDraft {
  return {
    label: labelFullDay(),
    quantity: 1,
    unitPriceHtCents: priceFullDay(),
    taxRatePercent: 0,
  };
}

export function lineFromHalfDay(): TjmLineDraft {
  return {
    label: labelHalfDay(),
    quantity: 1,
    unitPriceHtCents: priceHalfDay(),
    taxRatePercent: 0,
  };
}

export function lineFromSlot(start: TimeInput, end: TimeInput): TjmLineDraft {
  const { priceCents } = priceFromSlot(start, end);
  return {
    label: labelFromSlot(start, end),
    quantity: 1,
    unitPriceHtCents: priceCents,
    taxRatePercent: 0,
  };
}

export function lineFromHours(hours: number): TjmLineDraft {
  return {
    label: labelFromHours(hours),
    quantity: 1,
    unitPriceHtCents: priceFromHours(hours),
    taxRatePercent: 0,
  };
}
