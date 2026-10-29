export type ShowcaseProject = {
  id: string;
  name: string;
  type: "Site vitrine" | "E-commerce" | "Application Web";
  style: "Pro" | "Essentiel";
  url: string;
  image?: string;
  previewFrom: string;
  previewTo: string;
  live?: boolean;
};

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: "maison-lune",
    name: "Maison Lune",
    type: "Site vitrine",
    style: "Pro",
    url: "/demo/gastro",
    image: "/images/showcase/maison-lune.jpg",
    previewFrom: "from-amber-800",
    previewTo: "to-stone-950",
    live: true,
  },
  {
    id: "aria-coach",
    name: "Aria Coach",
    type: "Site vitrine",
    style: "Essentiel",
    url: "/demo/vitrine",
    image: "/images/showcase/aria-coach-studio.jpg",
    previewFrom: "from-stone-700",
    previewTo: "to-emerald-950",
    live: true,
  },
  {
    id: "atelier-seve",
    name: "Atelier Sève",
    type: "Site vitrine",
    style: "Essentiel",
    url: "/demo/coiffure",
    image: "/images/showcase/atelier-seve.jpg",
    previewFrom: "from-rose-900",
    previewTo: "to-stone-950",
    live: true,
  },
];

export const offersFaq = [
  {
    q: "Quel est le délai de création d'un site ?",
    a: "En moyenne entre une et trois semaines selon la complexité et la disponibilité de vos contenus. Les 149 € de création couvrent la conception et la mise en ligne initiale d’un site vitrine. Un planning précis est communiqué au démarrage.",
  },
  {
    q: "Comment fonctionne la tarification ?",
    a: "Création du site vitrine : 149 € une seule fois. Hébergement chez CodeByToma (optionnel) : 30 €/mois. Toute modification, amélioration ou projet sur-mesure se facture à part, au TJM ou en forfait jours — ce n’est pas inclus dans l’hébergement.",
  },
  {
    q: "Je ne suis pas à l'aise avec l'informatique — est-ce pour moi ?",
    a: "Oui. Si j’héberge votre site, vous n’avez pas à gérer la technique (mise en ligne, sécurité, sauvegardes). Pour faire évoluer le contenu ou ajouter une fonction, on en discute et on chiffre au TJM.",
  },
  {
    q: "Que comprend la création à 149 € ?",
    a: "La conception et la mise en ligne d’un site vitrine : structure, design, pages essentielles et formulaire de contact. L’hébergement n’est inclus que si vous choisissez l’option à 30 €/mois.",
  },
  {
    q: "Que couvre l’hébergement à 30 €/mois ?",
    a: "Uniquement l’hébergement chez moi : site en ligne, nom de domaine, HTTPS, sauvegardes et surveillance. Aucune modification de texte, photo ou fonctionnalité n’est incluse.",
  },
  {
    q: "Comment sont facturées les modifications ?",
    a: "Au TJM (380 €/jour indicatif) ou en forfait jours, sur devis. Exemples : changer des textes, ajouter une section, une réservation, un espace client. C’est toujours distinct de l’hébergement.",
  },
  {
    q: "Proposez-vous des applications web ou de l'e-commerce ?",
    a: "Oui. Ces projets sont chiffrés au TJM ou en forfait jours, séparément de la création vitrine et de l’hébergement. Contactez-moi pour en discuter.",
  },
  {
    q: "Puis-je héberger le site ailleurs ?",
    a: "Oui. Dans ce cas, il n’y a pas d’abonnement : je livre le projet (création / TJM) et vous gardez votre hébergeur. Un support ponctuel reste possible au TJM.",
  },
  {
    q: "Quel est l'engagement de l'hébergement ?",
    a: "L’hébergement est souscrit pour une durée initiale de 12 mois, puis reconduit tacitement. Pendant toute la durée, le site reste hébergé chez CodeByToma. Modalités de résiliation précisées au contrat.",
  },
];
