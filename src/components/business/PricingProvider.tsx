"use client";

import { createContext, useContext } from "react";
import {
  buildPricingContent,
  type FeesEur,
  type PricingContent,
} from "@/data/pricing";
import { buildOffersFaq, type FaqItem } from "@/data/businessOffers";

type PricingContextValue = PricingContent & {
  fees: FeesEur;
  faq: FaqItem[];
};

const PricingContext = createContext<PricingContextValue | null>(null);

export function PricingProvider({
  fees,
  children,
}: {
  fees: FeesEur;
  children: React.ReactNode;
}) {
  const content = buildPricingContent(fees);
  const value: PricingContextValue = {
    ...content,
    fees,
    faq: buildOffersFaq(fees),
  };

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

export function usePricing(): PricingContextValue {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error("usePricing doit être utilisé dans PricingProvider");
  }
  return ctx;
}
