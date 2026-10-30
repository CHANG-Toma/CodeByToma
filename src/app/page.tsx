import type { Metadata } from "next";
import BusinessNav from "@/components/business/BusinessNav";
import BusinessHero from "@/components/business/BusinessHero";
import BusinessBenefits from "@/components/business/BusinessBenefits";
import BusinessOffers from "@/components/business/BusinessOffers";
import BusinessProcess from "@/components/business/BusinessProcess";
import BusinessSubscription from "@/components/business/BusinessSubscription";
import BusinessApproach from "@/components/business/BusinessApproach";
import BusinessFaq from "@/components/business/BusinessFaq";
import BusinessContact from "@/components/business/BusinessContact";
import BusinessFooter from "@/components/business/BusinessFooter";
import BusinessStickyCta from "@/components/business/BusinessStickyCta";
import BusinessMarquee from "@/components/business/BusinessMarquee";
import { PricingProvider } from "@/components/business/PricingProvider";
import JsonLd from "@/components/seo/JsonLd";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE_HOME,
  SITE_URL,
} from "@/lib/seo";
import {
  feesToEuros,
  getOperationalFees,
} from "@/server/application/fees";
import { buildOffersFaq } from "@/data/businessOffers";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE_HOME,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: SITE_TITLE_HOME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
        type: OG_IMAGE.type,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_HOME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default async function HomePage() {
  const fees = feesToEuros(await getOperationalFees());
  const faq = buildOffersFaq(fees);

  return (
    <>
      <JsonLd faq={faq} fees={fees} />
      <PricingProvider fees={fees}>
        <div className="business-theme relative min-h-screen bg-ink text-mist">
          <a
            href="#contenu-principal"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-snow focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-ink"
          >
            Aller au contenu
          </a>
          <BusinessNav />
          <main id="contenu-principal">
            <BusinessHero />
            <BusinessMarquee />
            <BusinessBenefits />
            <BusinessProcess />
            <BusinessOffers />
            <BusinessSubscription />
            <BusinessApproach />
            <BusinessFaq />
            <BusinessContact />
          </main>
          <BusinessFooter />
          <BusinessStickyCta />
        </div>
      </PricingProvider>
    </>
  );
}
