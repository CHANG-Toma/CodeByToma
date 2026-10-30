import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

const display = localFont({
  src: "../../../fonts/fraunces-latin-wght-normal.woff2",
  variable: "--font-salon-display",
  weight: "400 700",
  display: "swap",
});

const body = localFont({
  src: "../../../fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-salon-body",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atelier Sève — Démo Salon de Coiffure",
  description:
    "Exemple CodeByToma : site vitrine salon de coiffure — création 149 €, hébergement 30 €/mois.",
  robots: { index: false, follow: false },
};

const themeVars = {
  ["--sv-bg"]: "#0e0d0c",
  ["--sv-surface"]: "#181614",
  ["--sv-ink"]: "#f4efe9",
  ["--sv-muted"]: "#9e948a",
  ["--sv-rose"]: "#d4a0a4",
  ["--sv-rose-deep"]: "#b87a80",
  ["--sv-pearl"]: "#e8dfd4",
  ["--sv-border"]: "rgba(244, 239, 233, 0.12)",
} as CSSProperties;

export default function CoiffureDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[family-name:var(--font-salon-body)]`}
      style={themeVars}
    >
      {children}
    </div>
  );
}
