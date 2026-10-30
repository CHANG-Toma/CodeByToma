"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePricing } from "@/components/business/PricingProvider";
import type { PricingOfferCard, PricingFeature } from "@/data/pricing";
import { showcaseProjects, type ShowcaseProject } from "@/data/businessOffers";

const MAILTO = "mailto:toma11chang@gmail.com";

const mailtoHref = (subject: string) =>
  `${MAILTO}?subject=${encodeURIComponent(subject)}`;

const CtaLink = ({
  href,
  featured,
  children,
}: {
  href: string;
  featured?: boolean;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className={cn(
      "group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[13px] font-medium transition-all",
      featured
        ? "bg-snow text-ink hover:opacity-90"
        : "border border-cbtBorder text-snow hover:border-cbtBorderStrong",
    )}
  >
    {children}
  </a>
);

const FeatureItem = ({
  feature,
  featured,
}: {
  feature: PricingFeature;
  featured: boolean;
}) => (
  <li className="flex items-start gap-2.5 text-[13px] leading-relaxed text-mist">
    <Check
      className={cn(
        "mt-0.5 h-3.5 w-3.5 shrink-0",
        featured ? "text-snow/70" : "text-snow/50",
      )}
      strokeWidth={1.75}
    />
    <span className="min-w-0 flex-1">
      <span>{feature.text}</span>
      {feature.detail ? (
        <span className="mt-1.5 block border-l-2 border-snow/15 pl-2.5 text-[12px] leading-relaxed text-mist/75">
          {feature.detail}
        </span>
      ) : null}
    </span>
  </li>
);

const OfferCard = ({
  card,
  index,
}: {
  card: PricingOfferCard;
  index: number;
}) => {
  const { setupFee, hostingFee } = usePricing();
  const isFeatured = card.featured === true;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 md:p-7",
        isFeatured
          ? "border-snow/35 bg-surface shadow-[0_16px_48px_-20px_rgba(0,0,0,0.55)] md:-mt-1 md:mb-1"
          : "border-cbtBorder bg-cbtFill/15 hover:border-cbtBorderStrong",
      )}
    >
      {card.badge ? (
        <span className="mb-4 inline-flex w-fit items-center rounded-md bg-snow px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
          {card.badge}
        </span>
      ) : (
        <span className="mb-4 block h-[26px]" aria-hidden />
      )}

      <h3 className="text-xl font-semibold text-snow">{card.title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-mist">{card.tagline}</p>

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-xl border px-4 py-4",
          isFeatured
            ? "border-snow/25 bg-snow/[0.04]"
            : "border-cbtBorder bg-ink/30",
        )}
      >
        <p className="text-[2rem] font-semibold leading-none tracking-tight text-snow">
          {card.price}
          <span className="text-base font-normal text-mist">{card.period}</span>
        </p>
        {card.id === "hebergement" ? (
          <p className="mt-2 text-[12px] text-mist/75">
            En plus de la création ({setupFee.amount} €) si le site est chez moi
          </p>
        ) : null}
        {card.id === "creation" ? (
          <p className="mt-2 text-[12px] text-mist/75">
            Hébergement optionnel : {hostingFee.amount} €/mois
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-[13px] font-medium leading-snug text-snow/90">
        {card.summary}
      </p>

      <ul className="mt-6 flex-1 space-y-2.5 border-t border-cbtBorder pt-6">
        {card.features.map((feature) => (
          <FeatureItem
            key={feature.text}
            feature={feature}
            featured={isFeatured}
          />
        ))}
      </ul>

      <CtaLink href={mailtoHref(card.ctaSubject)} featured={card.featured}>
        {card.cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </CtaLink>
    </motion.article>
  );
};

const SurMesureBanner = () => {
  const { surMesureSection } = usePricing();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mt-24 overflow-hidden rounded-2xl border border-cbtBorder bg-gradient-to-br from-cbtFill via-surface/60 to-transparent px-8 py-12 text-center md:px-12 md:py-14"
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-mist/70">
        Sur-mesure
      </p>
      <h3 className="mx-auto mt-3 max-w-xl text-xl font-semibold tracking-tight text-snow md:text-2xl">
        {surMesureSection.title}
      </h3>
      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
        {surMesureSection.text}
      </p>
      <a
        href={mailtoHref(surMesureSection.ctaSubject)}
        className="group mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-snow px-5 py-2.5 text-[13px] font-medium text-ink transition-opacity hover:opacity-90"
      >
        {surMesureSection.cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </motion.div>
  );
};

const ProjectPreview = ({ project }: { project: ShowcaseProject }) => (
  <div
    className={cn(
      "relative aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br",
      !project.image && project.previewFrom,
      !project.image && project.previewTo,
    )}
  >
    {project.image ? (
      <Image
        src={project.image}
        alt={`Aperçu ${project.name}`}
        fill
        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    ) : (
      <>
        <div className="absolute inset-x-3 top-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
        <div className="absolute inset-x-4 bottom-4 top-10 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex h-full flex-col justify-end p-4">
            <div className="space-y-2">
              <div className="h-2 w-2/3 rounded bg-white/20" />
              <div className="h-2 w-1/2 rounded bg-white/10" />
              <div className="mt-3 h-6 w-24 rounded bg-white/15" />
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

const ShowcaseCard = ({
  project,
  index,
}: {
  project: ShowcaseProject;
  index: number;
}) => {
  const isExternal = project.url.startsWith("http");
  const isLive =
    project.live !== false && (isExternal || project.url.startsWith("/"));

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cbtBorder bg-surface/40 transition-all duration-300 hover:z-10 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-cbtBorderStrong hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6)]"
    >
      <div className="overflow-hidden p-3 pb-0">
        <ProjectPreview project={project} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold text-snow">{project.name}</h3>

        {isLive ? (
          <a
            href={project.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group/btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cbtBorder px-4 py-2.5 text-[13px] font-medium text-snow transition-colors hover:border-cbtBorderStrong md:w-auto"
          >
            Voir le projet
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        ) : (
          <a
            href="#contact"
            className="group/btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cbtBorder px-4 py-2.5 text-[13px] font-medium text-mist transition-colors hover:border-cbtBorderStrong hover:text-snow md:w-auto"
          >
            Demander une démo
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        )}
      </div>
    </motion.article>
  );
};

const BusinessOffers = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });
  const {
    setupFee,
    hostingFee,
    offersSection,
    pricingOffers,
  } = usePricing();

  return (
    <section
      id="offres"
      className="scroll-mt-24 border-t border-cbtBorder px-6 py-24 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-mist/70">
            {offersSection.label}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-snow md:text-[1.85rem]">
            {offersSection.heading}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-mist md:text-base">
            {offersSection.description}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {pricingOffers.map((card, i) => (
            <OfferCard key={card.id} card={card} index={i} />
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-mist/80">
          {offersSection.commitment}
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] leading-relaxed text-mist/60">
          {offersSection.evolutionNote}
        </p>

        <SurMesureBanner />

        <div className="mt-24 border-t border-cbtBorder pt-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-mist/70">
              Réalisations
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-snow md:text-2xl">
              Découvrez nos réalisations
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-mist">
              Exemples de sites vitrine — création {setupFee.amount} €,
              hébergement optionnel {hostingFee.amount} €/mois. Projets plus
              poussés chiffrés au TJM.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseProjects.map((project, i) => (
              <ShowcaseCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessOffers;
