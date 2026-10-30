import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

const display = localFont({
  src: "../../../fonts/cormorant-garamond-latin-wght-normal.woff2",
  variable: "--font-gastro-display",
  weight: "400 700",
  display: "swap",
});

const body = localFont({
  src: "../../../fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-gastro-body",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maison Lune — Démo Site Vitrine",
  description:
    "Exemple CodeByToma : site vitrine restaurant — création 149 €, hébergement 30 €/mois.",
  robots: { index: false, follow: false },
};

const themeVars = {
  ["--mg-bg"]: "#140f0c",
  ["--mg-ink"]: "#f3ebe2",
  ["--mg-muted"]: "#b7a99a",
  ["--mg-gold"]: "#d4a574",
  ["--mg-wine"]: "#8b2e2e",
} as CSSProperties;

export default function GastroDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[family-name:var(--font-gastro-body)]`}
      style={themeVars}
    >
      {children}
    </div>
  );
}
