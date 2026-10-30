"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Aurora from "@/components/Aurora";
import BlurText from "@/components/BlurText";
import ShinyText from "@/components/ShinyText";
import { usePricing } from "@/components/business/PricingProvider";
import logoCodeByToma from "../../../public/images/logo-codebytoma.png";

const heroTitleDone = [{ filter: "blur(0px)", opacity: 1, y: 0 }] as const;

const BusinessHero = () => {
  const { setupFee, hostingFee } = usePricing();
  const { resolvedTheme } = useTheme();
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const isLight = resolvedTheme === "light";

  const auroraStops = useMemo(
    () =>
      isLight
        ? ["#b8c2d0", "#dbe4ef", "#8fa0b5"]
        : ["#3d4d66", "#5a6d8a", "#1a2433"],
    [isLight]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!logoGroupRef.current) return;
      const rx = (e.clientY - window.innerHeight / 2) / 55;
      const ry = (window.innerWidth / 2 - e.clientX) / 55;
      logoGroupRef.current.style.transition = "transform 0.3s ease-out";
      logoGroupRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const onLeave = () => {
      if (!logoGroupRef.current) return;
      logoGroupRef.current.style.transition = "transform 0.5s ease-out";
      logoGroupRef.current.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      id="accueil"
      className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-20 pt-28 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-ink" />
        <div
          className="absolute inset-0"
          style={{ opacity: "var(--cbt-hero-aurora-opacity)" }}
        >
          <Aurora
            colorStops={auroraStops}
            amplitude={isLight ? 0.65 : 0.85}
            blend={isLight ? 0.42 : 0.5}
            speed={0.65}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/45 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,transparent_40%,var(--cbt-ink)_88%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
        <div>
          <ShinyText
            text="CodeByToma · Code by Toma · Sites & accompagnement"
            speed={3}
            color="var(--cbt-hero-eyebrow)"
            shineColor="var(--cbt-hero-shine)"
            className="text-[12px] font-medium uppercase tracking-[0.16em] text-heroEyebrow"
          />

          <div className="mt-4">
            <h1 className="max-w-xl">
              <BlurText
                as="span"
                text="Une présence en ligne professionnelle,"
                delay={50}
                animateBy="words"
                direction="top"
                animationTo={[...heroTitleDone]}
                className="text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-heroFg sm:text-5xl md:text-[3.1rem]"
              />
              <BlurText
                as="span"
                text="qui grandit avec vous."
                delay={70}
                animateBy="words"
                direction="top"
                animationTo={[...heroTitleDone]}
                className="mt-1 text-[2.35rem] font-normal leading-[1.12] tracking-tight text-heroFgAccent sm:text-5xl md:text-[3.1rem]"
              />
            </h1>
          </div>

          <motion.p
            className="mt-6 max-w-lg text-[15px] leading-relaxed text-heroFgMuted md:text-base"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Une présence en ligne professionnelle : création dès{" "}
            {setupFee.amount} €, hébergement optionnel à {hostingFee.amount}{" "}
            €/mois, évolutions au TJM.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <a
              href="mailto:toma11chang@gmail.com?subject=CodeByToma%20—%20Devis%20gratuit"
              className="group inline-flex items-center gap-2 rounded-md bg-snow px-5 py-2.5 text-[13px] font-medium text-ink"
            >
              Obtenir un devis gratuit
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#offres"
              className="rounded-md border border-[color:var(--cbt-hero-btn-border)] px-5 py-2.5 text-[13px] font-medium text-heroFg transition-colors hover:border-cbtBorderStrong"
            >
              Découvrir nos offres
            </a>
          </motion.div>
        </div>

        <div className="flex justify-center md:justify-end">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.15 },
              scale: {
                duration: 0.6,
                delay: 0.15,
                type: "spring",
                stiffness: 120,
              },
              y: {
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
            whileHover={{ scale: 1.04 }}
          >
            <div
              ref={logoGroupRef}
              className="relative will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute -inset-8 rounded-full bg-snow/10 blur-3xl"
                animate={{
                  opacity: [0.2, 0.45, 0.2],
                  scale: [0.92, 1.08, 0.92],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              />
              <motion.div
                className="absolute -inset-5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, var(--cbt-snow) 8%, transparent 18%, transparent 55%, var(--cbt-snow) 62%, transparent 72%)",
                  opacity: 0.35,
                  maskImage:
                    "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
                  WebkitMaskImage:
                    "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                aria-hidden
              />
              <motion.div
                className="absolute -inset-2 rounded-full border border-dashed border-cbtBorderStrong/60"
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                aria-hidden
              />
              <motion.div
                className="absolute -inset-7"
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                aria-hidden
              >
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-snow shadow-[0_0_12px_var(--cbt-snow)]" />
                <span className="absolute bottom-[18%] left-[8%] h-1.5 w-1.5 rounded-full bg-snow/70" />
              </motion.div>
              <motion.div
                className="absolute -inset-10"
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                aria-hidden
              >
                <span className="absolute right-[12%] top-[30%] h-1 w-1 rounded-full bg-mist" />
              </motion.div>
              <div className="relative h-52 w-52 overflow-hidden rounded-full border border-cbtBorder bg-snow shadow-[0_0_40px_-12px_var(--cbt-snow)] md:h-64 md:w-64">
                <Image
                  src={logoCodeByToma}
                  alt="Logo Code By Toma — Développeur Informatique"
                  fill
                  sizes="(max-width: 768px) 208px, 256px"
                  priority
                  className="scale-[1.38] rounded-full object-cover object-center"
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-snow/25 to-transparent"
                  initial={{ x: "-120%" }}
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    ease: "easeInOut",
                  }}
                  aria-hidden
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BusinessHero;
