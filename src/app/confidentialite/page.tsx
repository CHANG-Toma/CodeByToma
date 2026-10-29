import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité et informations RGPD — CodeByToma.",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#0e141c] px-6 py-16 text-[#e8edf4]">
      <article className="mx-auto max-w-2xl space-y-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8fa0b5]">
          CodeByToma
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[#8fa0b5]">
          Dernière mise à jour : octobre 2026. Document informatif conforme aux
          principes du RGPD et aux recommandations de la CNIL.
        </p>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">1. Responsable</h2>
          <p>
            Le traitement est opéré par Toma Chang — activité CodeByToma
            (création de sites et abonnements de maintenance). Contact :{" "}
            <a
              className="text-sky-300 hover:underline"
              href="mailto:toma11chang@gmail.com"
            >
              toma11chang@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">
            2. Données collectées
          </h2>
          <p>Nous collectons uniquement les données nécessaires :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Contrat / facturation</strong> :
              identité, e-mail, téléphone éventuel, adresse de facturation,
              devis, factures, paiements, abonnements.
            </li>
            <li>
              <strong className="text-white">Compte d&apos;accès</strong> :
              e-mail et mot de passe, protégés et non stockés en clair.
            </li>
            <li>
              <strong className="text-white">Connexion</strong> : historique
              d&apos;accès limité, sans enregistrement de votre mot de passe.
            </li>
          </ul>
          <p>
            Pas de publicité ciblée, pas de revente de données, pas de tracking
            marketing tiers sur l&apos;espace privé.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">
            3. Bases légales & finalités
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Exécution du contrat</strong> :
              gestion client, devis, factures, abonnements, espace de
              connexion.
            </li>
            <li>
              <strong className="text-white">Intérêt légitime</strong> limité :
              sécurité des comptes et relances de paiement.
            </li>
            <li>
              <strong className="text-white">Obligation légale</strong> :
              conservation des factures selon le droit français.
            </li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">4. Durées</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Données de compte / contrat : durée de la relation + durée
              nécessaire aux obligations légales.
            </li>
            <li>
              Factures : conservation légale (ne sont pas effacées ; le contact
              peut être anonymisé en cas de droit à l&apos;oubli).
            </li>
            <li>Connexion : durée limitée, puis nouvelle authentification.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits d&apos;accès,
            rectification, effacement (dans les limites légales), limitation,
            opposition et portabilité. Pour les exercer :{" "}
            <a
              className="text-sky-300 hover:underline"
              href="mailto:toma11chang@gmail.com"
            >
              toma11chang@gmail.com
            </a>
            . Vous pouvez aussi introduire une réclamation auprès de la{" "}
            <a
              className="text-sky-300 hover:underline"
              href="https://www.cnil.fr"
              rel="noopener noreferrer"
              target="_blank"
            >
              CNIL
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-[#c5d0de]">
          <h2 className="text-lg font-medium text-white">6. Sécurité</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Mots de passe protégés, jamais stockés en clair.</li>
            <li>Connexion sécurisée et durée de session limitée.</li>
            <li>Protection contre les tentatives de connexion abusives.</li>
            <li>Accès réservé aux comptes autorisés.</li>
            <li>Échanges chiffrés en production.</li>
          </ul>
        </section>

        <p className="pt-4 text-sm">
          <Link href="/" className="text-sky-300 hover:underline">
            ← Retour au site
          </Link>
          {" · "}
          <Link href="/connexion" className="text-sky-300 hover:underline">
            Connexion
          </Link>
        </p>
      </article>
    </main>
  );
}
