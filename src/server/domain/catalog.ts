import type { MoneyCents } from "./money";

export const OFFER_KINDS = [
  "setup",
  "essentiel",
  "serenite",
  "premium",
  "custom",
] as const;

export type OfferKind = (typeof OFFER_KINDS)[number];

export type CatalogOfferSeed = {
  kind: OfferKind;
  label: string;
  description: string;
  priceCents: MoneyCents;
};

/** Source de vérité alignée sur src/data/pricing.ts (centimes). */
export const CATALOG_OFFERS: readonly CatalogOfferSeed[] = [
  {
    kind: "setup",
    label: "Création du site",
    description: "Frais uniques de conception et mise en ligne",
    priceCents: 14900,
  },
  {
    kind: "essentiel",
    label: "Abonnement Essentiel",
    description: "Site en ligne et sécurisé — 49 €/mois",
    priceCents: 4900,
  },
  {
    kind: "serenite",
    label: "Abonnement Sérénité",
    description: "Essentiel + mises à jour contenu — 65 €/mois",
    priceCents: 6500,
  },
  {
    kind: "premium",
    label: "Abonnement Premium",
    description: "Accompagnement complet — 159 €/mois",
    priceCents: 15900,
  },
  {
    kind: "custom",
    label: "Sur-mesure",
    description: "Projet hors grille — montant défini au devis",
    priceCents: 0,
  },
] as const;

export const DEFAULT_COMMITMENT_MONTHS = 12;
