"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { usePricing } from "@/components/business/PricingProvider";

const BusinessSubscription = () => {
  const { setupFee, hostingFee } = usePricing();
  const points = [
    `${setupFee.amount} € une seule fois pour créer votre site vitrine`,
    `Hébergement chez moi : ${hostingFee.amount} €/mois (optionnel)`,
    "Hébergement = mise en ligne, domaine, HTTPS, sauvegardes, surveillance",
    "Modifications et améliorations : facturées au TJM, à part",
    "Vous avez déjà un hébergeur ? Pas d’abonnement — projet / TJM seulement",
    "Engagement hébergement 12 mois, puis reconduction",
  ];

  return (
    <section
      id="abonnement"
      className="scroll-mt-24 border-t border-cbtBorder px-6 py-24 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-snow md:text-[1.85rem]">
              Hébergement &nbsp;≠&nbsp; évolutions
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mist md:text-base">
              L’abonnement à {hostingFee.amount} €/mois n’existe que si vous
              voulez que j’héberge le site. Il ne couvre pas les changements de
              contenu ni les nouvelles fonctions — ceux-ci se chiffrent au TJM.
            </p>
            <p className="mt-6 text-[15px] font-medium text-snow">
              Un site chez vous, ou chez moi.
              <span className="mt-1 block font-normal text-mist">
                Chez vous : je livre le projet, sans abonnement. Chez moi : +
                {hostingFee.amount} €/mois pour rester en ligne sans gérer la
                technique.
              </span>
            </p>
            <a
              href="#offres"
              className="mt-6 inline-flex text-[13px] font-medium text-snow underline decoration-cbtBorderStrong underline-offset-4 transition-colors hover:decoration-snow"
            >
              Voir les tarifs
            </a>
          </motion.div>

          <ul className="space-y-3">
            {points.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-3 border-b border-cbtBorder pb-3 last:border-0"
              >
                <Check className="h-4 w-4 shrink-0 text-snow" strokeWidth={2} />
                <span className="text-[14px] text-snow/90">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BusinessSubscription;
