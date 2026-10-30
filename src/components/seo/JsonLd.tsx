import { offersFaq as defaultOffersFaq, type FaqItem } from "@/data/businessOffers";
import type { FeesEur } from "@/data/pricing";
import {
  HOSTING_FEE_EUR,
  SETUP_FEE_EUR,
  TJM_FEE_EUR,
} from "@/data/fees";
import {
  CONTACT,
  SITE_DESCRIPTION,
  SITE_LOGO,
  SITE_NAME,
  SITE_NAME_ALIASES,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";

const DEFAULT_FEES: FeesEur = {
  setup: SETUP_FEE_EUR,
  hosting: HOSTING_FEE_EUR,
  tjm: TJM_FEE_EUR,
};

const organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: [...SITE_NAME_ALIASES],
  legalName: "Code by Toma",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}${SITE_LOGO.url}`,
  },
  image: `${SITE_URL}${SITE_LOGO.url}`,
  email: CONTACT.email,
  telephone: CONTACT.phone,
  founder: {
    "@type": "Person",
    name: "Toma Chang",
    alternateName: ["Toma", "Code by Toma"],
    url: SITE_URL,
    jobTitle: "Développeur Informatique",
  },
  sameAs: [] as string[],
  areaServed: {
    "@type": "AdministrativeArea",
    name: CONTACT.region,
  },
};

const website = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: [...SITE_NAME_ALIASES],
  description: SITE_TAGLINE,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "fr-FR",
};

export default function JsonLd({
  faq = defaultOffersFaq,
  fees = DEFAULT_FEES,
}: {
  faq?: FaqItem[];
  fees?: FeesEur;
}) {
  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name: SITE_NAME,
    alternateName: [...SITE_NAME_ALIASES],
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}${SITE_LOGO.url}`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Virement, carte",
    areaServed: [
      { "@type": "Country", name: "France" },
      { "@type": "AdministrativeArea", name: CONTACT.region },
    ],
    serviceType: [
      "Création de sites web",
      "Site vitrine",
      "Hébergement de site web",
      "Développement au TJM",
    ],
    provider: { "@id": `${SITE_URL}/#organization` },
    offers: [
      {
        "@type": "Offer",
        name: "Création du site",
        price: String(fees.setup),
        priceCurrency: "EUR",
        description:
          "Conception et mise en ligne d'un site vitrine (structure, design, pages essentielles).",
        url: `${SITE_URL}/#offres`,
      },
      {
        "@type": "Offer",
        name: "Hébergement",
        price: String(fees.hosting),
        priceCurrency: "EUR",
        description:
          "Site en ligne chez CodeByToma : HTTPS, sauvegardes, surveillance. Évolutions facturées au TJM.",
        url: `${SITE_URL}/#offres`,
      },
      {
        "@type": "Offer",
        name: "Évolutions & projets (TJM)",
        price: String(fees.tjm),
        priceCurrency: "EUR",
        description:
          "Modifications, améliorations et projets sur-mesure — chiffrage au TJM ou forfait jours, hors hébergement.",
        url: `${SITE_URL}/#offres`,
      },
    ],
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, professionalService, website, faqPage],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
