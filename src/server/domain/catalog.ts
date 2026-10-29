import type { MoneyCents } from "./money";
import { hostingFee, setupFee } from "@/data/pricing";

export const OFFER_KINDS = ["setup", "hosting", "custom"] as const;

export type OfferKind = (typeof OFFER_KINDS)[number];

export type CatalogOfferSeed = {
  kind: OfferKind;
  label: string;
  description: string;
  priceCents: MoneyCents;
  isActive?: boolean;
};

/** Source de vérité alignée sur src/data/pricing.ts (centimes). */
export const CATALOG_OFFERS: readonly CatalogOfferSeed[] = [
  {
    kind: "setup",
    label: "Création du site",
    description: "Frais uniques de conception et mise en ligne (vitrine)",
    priceCents: setupFee.amount * 100,
  },
  {
    kind: "hosting",
    label: "Hébergement mensuel",
    description: `Hébergement chez CodeByToma — ${hostingFee.amount} €/mois (sans modifications)`,
    priceCents: hostingFee.amount * 100,
  },
  {
    kind: "custom",
    label: "Prestation TJM (1 jour)",
    description: "Évolutions, améliorations et sur-mesure — 380 €/jour indicatif",
    priceCents: 38000,
  },
] as const;
