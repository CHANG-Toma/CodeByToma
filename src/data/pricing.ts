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

/** Création vitrine — frais uniques. */
export const setupFee = {
  amount: SETUP_FEE_EUR,
  label: `Création du site : ${SETUP_FEE_EUR} €`,
  detail: "frais uniques pour un site vitrine",
  shortLine: `${SETUP_FEE_EUR} € de création · une seule fois`,
  plainExplanation: `${SETUP_FEE_EUR} € une seule fois pour concevoir et mettre en ligne votre site vitrine. L’hébergement chez CodeByToma est optionnel (${HOSTING_FEE_EUR} €/mois). Les modifications et améliorations se facturent à part, au TJM.`,
};

/** Hébergement uniquement — si le client veut que tu héberges. */
export const hostingFee = {
  amount: HOSTING_FEE_EUR,
  label: `Hébergement : ${HOSTING_FEE_EUR} €/mois`,
  detail: "uniquement si le site est hébergé chez CodeByToma",
  shortLine: `${HOSTING_FEE_EUR} €/mois · hébergement`,
  plainExplanation: `${HOSTING_FEE_EUR} € par mois pour garder votre site en ligne chez moi : hébergement, nom de domaine, HTTPS, sauvegardes et surveillance. Aucune modification de contenu ni d’évolution n’est incluse.`,
};

/** TJM de référence (évolutions / projets) — distinct de l’hébergement. */
export const tjmFee = {
  amount: TJM_FEE_EUR,
  label: `TJM : ${TJM_FEE_EUR} € / jour`,
  detail: "Modifications, améliorations et sur-mesure — hors hébergement",
  shortLine: `${TJM_FEE_EUR} € / jour (TJM)`,
};

/** Formulations courtes réutilisées sur le site. */
export const pricingSummary = {
  creationFormatted: `${setupFee.amount} €`,
  hostingFormatted: `${hostingFee.amount} €/mois`,
  tjmFormatted: `${tjmFee.amount} €/jour`,
  subscriptionFrom: `${hostingFee.amount} €/mois`,
  short: `Création ${setupFee.amount} € · Hébergement ${hostingFee.amount} €/mois · Évolutions au TJM`,
  pitch: `Création du site à ${setupFee.amount} €, hébergement optionnel à ${hostingFee.amount} €/mois, évolutions et projets au TJM.`,
};

export const offersSection = {
  label: "Tarifs",
  heading: "Simple : création, hébergement, puis TJM si besoin",
  description: `Vous payez la création une fois. Si vous voulez que j’héberge le site, c’est ${HOSTING_FEE_EUR} €/mois. Toute modification ou amélioration se facture à part, au taux journalier — pas dans l’hébergement.`,
  commitment:
    "Hébergement : engagement initial 12 mois, puis reconduction. Résiliation selon le contrat.",
  evolutionNote:
    "Changer un texte, ajouter une section, une réservation, un espace client… = devis au TJM (ou forfait jours), distinct de l’hébergement.",
};

/** Cartes affichées sur la page d’accueil. */
export const pricingOffers: PricingOfferCard[] = [
  {
    id: "creation",
    title: "Création",
    tagline: "Votre site vitrine conçu et mis en ligne.",
    summary: "Design, pages essentielles et formulaire de contact — une seule fois.",
    price: `${SETUP_FEE_EUR} €`,
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
    price: `${HOSTING_FEE_EUR} €`,
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
    ctaSubject: `CodeByToma — Hébergement ${HOSTING_FEE_EUR} €/mois`,
    featured: true,
    badge: "Optionnel",
  },
  {
    id: "tjm",
    title: "Évolutions & projets",
    tagline: "Améliorations, nouvelles fonctions, sur-mesure.",
    summary:
      "Tout ce qui n’est pas de l’hébergement : au TJM ou en forfait jours, sur devis.",
    price: `${TJM_FEE_EUR} €`,
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
        text: `Jamais inclus dans les ${HOSTING_FEE_EUR} € d’hébergement`,
      },
    ],
    cta: "Parler de mon projet",
    ctaSubject: "CodeByToma — Projet / TJM",
  },
];

/** @deprecated alias — compat imports anciens */
export const pricingAbonnement = pricingOffers;
export const subscriptionSection = offersSection;

export const surMesureSection = {
  id: "sur-mesure",
  title: "Un besoin précis ? On chiffre au TJM.",
  text: "Réservation, espace client, boutique, automatisation… On définit le périmètre ensemble, puis on facture en forfait jours ou au taux journalier — séparément de l’hébergement.",
  cta: "Discutons de votre projet",
  ctaSubject: "CodeByToma — Projet sur-mesure",
};
