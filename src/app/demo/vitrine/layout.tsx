import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";

const display = localFont({
  src: [
    {
      path: "../../../fonts/cormorant-garamond-latin-wght-normal.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../../fonts/cormorant-garamond-latin-wght-italic.woff2",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-aria-display",
  display: "swap",
});

const body = localFont({
  src: "../../../fonts/outfit-latin-wght-normal.woff2",
  variable: "--font-aria-body",
  weight: "300 600",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aria Coach — Démo Site Vitrine",
  description:
    "Exemple CodeByToma : site vitrine coaching — création 149 €, hébergement optionnel 30 €/mois.",
  robots: { index: false, follow: false },
};

/** Studio éditorial — encre, lin, accent feuille. */
const themeVars = {
  ["--vk-bg"]: "#e9ebe6",
  ["--vk-ink"]: "#1a1f1c",
  ["--vk-muted"]: "#5c645e",
  ["--vk-accent"]: "#3d5c48",
  ["--vk-line"]: "rgba(26, 31, 28, 0.12)",
  ["--vk-surface"]: "#f4f5f1",
  ["--vk-deep"]: "#121612",
} as CSSProperties;

export default function VitrineDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[family-name:var(--font-aria-body)]`}
      style={themeVars}
    >
      {children}
    </div>
  );
}
