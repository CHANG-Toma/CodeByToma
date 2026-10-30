"use client";

import { usePricing } from "@/components/business/PricingProvider";

const BusinessMarquee = () => {
  const { setupFee, hostingFee } = usePricing();
  const items = [
    `Création ${setupFee.amount} €`,
    `Hébergement ${hostingFee.amount} €/mois`,
    "Évolutions au TJM",
    "Sur-mesure",
    "Devis gratuit",
    "CodeByToma",
  ];
  const unit = items.join("  ·  ") + "  ·  ";
  const track = Array.from({ length: 4 }, () => unit).join("");

  return (
    <div className="overflow-hidden border-y border-cbtBorder bg-surface/40 py-3.5">
      <div className="flex w-max animate-cbt-marquee text-[12px] font-medium uppercase tracking-[0.18em] text-mist/70 will-change-transform">
        <span className="shrink-0 whitespace-nowrap px-4">{track}</span>
        <span className="shrink-0 whitespace-nowrap px-4" aria-hidden>
          {track}
        </span>
      </div>
    </div>
  );
};

export default BusinessMarquee;
