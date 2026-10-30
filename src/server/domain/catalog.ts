import type { MoneyCents } from "./money";
import {
  HOSTING_FEE_CENTS,
  SETUP_FEE_CENTS,
  TJM_FEE_CENTS,
  TJM_FEE_EUR,
  HOSTING_FEE_EUR,
} from "@/data/fees";

export const OFFER_KINDS = ["setup", "hosting", "custom"] as const;

export type OfferKind = (typeof OFFER_KINDS)[number];

export type CatalogOfferSeed = {
  kind: OfferKind;
  label: string;
  description: string;
  priceCents: MoneyCents;
  isActive?: boolean;
};

/** Source de vérité alignée sur src/data/fees.ts (centimes). */
export const CATALOG_OFFERS: readonly CatalogOfferSeed[] = [
  {
    kind: "setup",
    label: "Création du site",
    description: "Frais uniques de conception et mise en ligne (vitrine)",
    priceCents: SETUP_FEE_CENTS,
  },
  {
    kind: "hosting",
    label: "Hébergement mensuel",
    description: `Hébergement chez CodeByToma — ${HOSTING_FEE_EUR} €/mois (sans modifications)`,
    priceCents: HOSTING_FEE_CENTS,
  },
  {
    kind: "custom",
    label: "Prestation TJM (1 jour)",
    description: `Évolutions, améliorations et sur-mesure — ${TJM_FEE_EUR} €/jour indicatif`,
    priceCents: TJM_FEE_CENTS,
  },
] as const;

/** Engagement initial type pour un abonnement d’hébergement. */
export const DEFAULT_COMMITMENT_MONTHS = 12;
