"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  format?: "number" | "currency";
};

const numberFormatter = new Intl.NumberFormat("fr-FR");
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function AnimatedMetric({ value, format = "number" }: Props) {
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayedValue(value);
      return;
    }

    const duration = 650;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedValue(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const display =
    format === "currency"
      ? currencyFormatter.format(displayedValue / 100)
      : numberFormatter.format(displayedValue);
  const finalDisplay =
    format === "currency"
      ? currencyFormatter.format(value / 100)
      : numberFormatter.format(value);

  return (
    <span
      className="inline-block min-w-[3ch] tabular-nums"
      aria-label={finalDisplay}
    >
      {display}
    </span>
  );
}
