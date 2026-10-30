import {
  HOSTING_FEE_EUR,
  SETUP_FEE_EUR,
  TJM_FEE_EUR,
} from "@/data/fees";

export type PricingFeature = {
  text: string;
  detail?: string;
};

export type PricingOfferCard = {
  id: string;
  title: string;
  tagline: string;
  summary: string;
  /** Prix affiché (ex. "149 €" ou "Sur devis") */
  price: string;
  /** Suite du prix (ex. "/mois", "une fois", "/jour") */
  period: string;
  features: PricingFeature[];
  cta: string;
  ctaSubject: string;
  featured?: boolean;
  badge?: string;
};

export type FeesEur = {
  setup: number;
  hosting: number;
  tjm: number;
};

export type PricingContent = {
  setupFee: {
    amount: number;
    label: string;
    detail: string;
    shortLine: string;
    plainExplanation: string;
  };
  hostingFee: {
    amount: number;
    label: string;
    detail: string;
    shortLine: string;
    plainExplanation: string;
  };
  tjmFee: {
    amount: number;
    label: string;
    detail: string;
    shortLine: string;
  };
  pricingSummary: {
    creationFormatted: string;
    hostingFormatted: string;
    tjmFormatted: string;
    subscriptionFrom: string;
    short: string;
    pitch: string;
  };
  offersSection: {
    label: string;
    heading: string;
    description: string;
    commitment: string;
    evolutionNote: string;
  };
  pricingOffers: PricingOfferCard[];
  surMesureSection: {
    id: string;
    title: string;
    text: string;
    cta: string;
    ctaSubject: string;
  };
};

/** Construit tous les textes marketing à partir des montants (€). */
export function buildPricingContent(fees: FeesEur): PricingContent {
  const { setup, hosting, tjm } = fees;

  const setupFee = {
    amount: setup,
    label: `Création du site : ${setup} €`,
    detail: "frais uniques pour un site vitrine",
    shortLine: `${setup} € de création · une seule fois`,
    plainExplanation: `${setup} € une seule fois pour concevoir et mettre en ligne votre site vitrine. L’hébergement chez CodeByToma est optionnel (${hosting} €/mois). Les modifications et améliorations se facturent à part, au TJM.`,
  };

  const hostingFee = {
    amount: hosting,
    label: `Hébergement : ${hosting} €/mois`,
    detail: "uniquement si le site est hébergé chez CodeByToma",
    shortLine: `${hosting} €/mois · hébergement`,
    plainExplanation: `${hosting} € par mois pour garder votre site en ligne chez moi : hébergement, nom de domaine, HTTPS, sauvegardes et surveillance. Aucune modification de contenu ni d’évolution n’est incluse.`,
  };

  const tjmFee = {
    amount: tjm,
    label: `TJM : ${tjm} € / jour`,
    detail: "Modifications, améliorations et sur-mesure — hors hébergement",
    shortLine: `${tjm} € / jour (TJM)`,
  };

  const pricingSummary = {
    creationFormatted: `${setup} €`,
    hostingFormatted: `${hosting} €/mois`,
    tjmFormatted: `${tjm} €/jour`,
    subscriptionFrom: `${hosting} €/mois`,
    short: `Création ${setup} € · Hébergement ${hosting} €/mois · Évolutions au TJM`,
    pitch: `Création du site à ${setup} €, hébergement optionnel à ${hosting} €/mois, évolutions et projets au TJM.`,
  };

  const offersSection = {
    label: "Tarifs",
    heading: "Simple : création, hébergement, puis TJM si besoin",
    description: `Vous payez la création une fois. Si vous voulez que j’héberge le site, c’est ${hosting} €/mois. Toute modification ou amélioration se facture à part, au taux journalier — pas dans l’hébergement.`,
    commitment:
      "Hébergement : engagement initial 12 mois, puis reconduction. Résiliation selon le contrat.",
    evolutionNote:
      "Changer un texte, ajouter une section, une réservation, un espace client… = devis au TJM (ou forfait jours), distinct de l’hébergement.",
  };

  const pricingOffers: PricingOfferCard[] = [
    {
      id: "creation",
      title: "Création",
      tagline: "Votre site vitrine conçu et mis en ligne.",
      summary:
        "Design, pages essentielles et formulaire de contact — une seule fois.",
      price: `${setup} €`,
      period: " une fois",
      features: [
        { text: "Site vitrine (jusqu’à ~3–5 pages)" },
        { text: "Design personnalisé" },
        { text: "Formulaire de contact" },
        { text: "Mise en ligne initiale" },
      ],
      cta: "Demander une création",
      ctaSubject: "CodeByToma — Création de site",
    },
    {
      id: "hebergement",
      title: "Hébergement",
      tagline: "Uniquement si vous voulez que j’héberge le site chez moi.",
      summary:
        "Le site reste en ligne, sécurisé et surveillé. Pas de modifications incluses.",
      price: `${hosting} €`,
      period: "/mois",
      features: [
        {
          text: "Hébergement + nom de domaine",
          detail: "Ex. votresite.fr — site accessible 24h/24.",
        },
        {
          text: "HTTPS + sauvegardes",
          detail: "Connexion sécurisée et copies de secours régulières.",
        },
        {
          text: "Surveillance de disponibilité",
          detail: "On vérifie que le site reste accessible.",
        },
        {
          text: "Modifications & améliorations : hors forfait",
          detail: "Facturées au TJM, sur devis.",
        },
      ],
      cta: "Choisir l’hébergement",
      ctaSubject: `CodeByToma — Hébergement ${hosting} €/mois`,
      featured: true,
      badge: "Optionnel",
    },
    {
      id: "tjm",
      title: "Évolutions & projets",
      tagline: "Améliorations, nouvelles fonctions, sur-mesure.",
      summary:
        "Tout ce qui n’est pas de l’hébergement : au TJM ou en forfait jours, sur devis.",
      price: `${tjm} €`,
      period: "/jour",
      features: [
        { text: "Modifications de contenu ou de design" },
        { text: "Nouvelles pages ou sections" },
        {
          text: "Fonctions métier",
          detail: "Réservation, espace client, e-commerce, automatisations…",
        },
        { text: "Forfait jours possible si le périmètre est clair" },
        {
          text: `Jamais inclus dans les ${hosting} € d’hébergement`,
        },
      ],
      cta: "Parler de mon projet",
      ctaSubject: "CodeByToma — Projet / TJM",
    },
  ];

  const surMesureSection = {
    id: "sur-mesure",
    title: "Un besoin précis ? On chiffre au TJM.",
    text: "Réservation, espace client, boutique, automatisation… On définit le périmètre ensemble, puis on facture en forfait jours ou au taux journalier — séparément de l’hébergement.",
    cta: "Discutons de votre projet",
    ctaSubject: "CodeByToma — Projet sur-mesure",
  };

  return {
    setupFee,
    hostingFee,
    tjmFee,
    pricingSummary,
    offersSection,
    pricingOffers,
    surMesureSection,
  };
}

const DEFAULT_FEES: FeesEur = {
  setup: SETUP_FEE_EUR,
  hosting: HOSTING_FEE_EUR,
  tjm: TJM_FEE_EUR,
};

const defaults = buildPricingContent(DEFAULT_FEES);

/** Défauts (seed / tests) — le site public utilise `buildPricingContent` + catalogue. */
export const setupFee = defaults.setupFee;
export const hostingFee = defaults.hostingFee;
export const tjmFee = defaults.tjmFee;
export const pricingSummary = defaults.pricingSummary;
export const offersSection = defaults.offersSection;
export const pricingOffers = defaults.pricingOffers;
export const surMesureSection = defaults.surMesureSection;

/** @deprecated alias — compat imports anciens */
export const pricingAbonnement = pricingOffers;
export const subscriptionSection = offersSection;
