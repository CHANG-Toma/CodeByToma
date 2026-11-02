"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Briefcase, Car, GraduationCap, MapPin } from "lucide-react";

const highlights = [
  {
    icon: <Briefcase className="w-5 h-5 text-purple" />,
    title: "Freelance & alternance",
    text: "Alternance Assistant Chef de Projet chez Syngenta depuis 2026. Missions freelance via CodeByToma en parallèle selon disponibilités.",
  },
  {
    icon: <GraduationCap className="w-5 h-5 text-purple" />,
    title: "M2 ENSITECH SQY",
    text: "Master Lead Developer Full Stack (2026–2027) à ENSITECH Saint-Quentin-en-Yvelines — en alternance chez Syngenta.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-purple" />,
    title: "Basé en Yvelines",
    text: "Interventions à distance et en présentiel en Île-de-France selon les besoins du projet.",
  },
  {
    icon: <Car className="w-5 h-5 text-purple" />,
    title: "Permis B et véhiculé",
    text: "Mobilité facilitée pour les réunions client, ateliers et accompagnement terrain.",
  },
];

const About = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  return (
    <section id="about" className="py-20 px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex items-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Profil</h2>
          <div className="ml-4 flex-grow h-[1px] bg-lightNavy" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glassmorphism rounded-lg p-6"
          >
            <p className="text-lightSlate leading-relaxed">
              En alternance chez Syngenta en tant qu&apos;Assistant Chef de
              Projet, je poursuis mon M2 Lead Developer Full Stack à ENSITECH
              SQY (2026–2027). Mon parcours combine gestion de projet et
              développement web.
            </p>
            <p className="text-lightSlate leading-relaxed mt-4">
              Je propose également mes services via CodeByToma pour la
              conception de sites web, intranets et applications sur mesure.
              Autonome, adaptable et orienté résultat.
            </p>
          </motion.div>

          <div className="space-y-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glassmorphism rounded-lg p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-lightSlate mt-1">{item.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
