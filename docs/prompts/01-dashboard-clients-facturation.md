# Prompt — Phase 1 : Dashboard clients / devis / factures / paiements

> À coller dans un **nouveau chat Agent** Cursor (idéalement dédié à cette feature).  
> Les rules `.cursor/rules/*.mdc` s’appliquent automatiquement : **les respecter avant chaque exécution**.

---

## Prompt à copier

```text
Tu travailles sur le repo CodeByToma (portfolio Next.js existant : site marketing public).

OBJECTIF PHASE 1
Créer un dashboard privé complet pour GÉRER mon activité solo :
clients, devis, factures, abonnements et paiements — aligné sur mes offres CodeByToma.

Lire et respecter AVANT de coder toutes les rules dans `.cursor/rules/` :
- 00-project-context.mdc
- 01-solid-architecture.mdc
- 02-rgpd-security.mdc
- 03-database-docker.mdc
- 04-billing-domain.mdc
- 05-nextjs-practices.mdc

CONTEXTE MÉTIER (source : src/data/pricing.ts)
- Création de site : 149 € une fois
- Abonnements mensuels : Essentiel 49 € · Sérénité 65 € · Premium 159 €
- Engagement type 12 mois, puis reconduction
- Sur-mesure : devis hors grille
- Devise : EUR · montants stockés en centimes (integer)
- UI et documents en français

CONTRAINTES D’ARCHITECTURE
1. Ne casse PAS le site marketing public (/, /portfolio, /demo/*, SEO, sitemap, robots).
2. PAS d’URL `/admin`, `/dashboard`, `/backoffice`, `/login` racine. Le dashboard est monté sous un chemin SECRET :
   - variable d’env `DASHBOARD_BASE_PATH` (ex. `studio-xk7m2p` → URL `/studio-xk7m2p/...`)
   - segment dynamique validé serveur ; mauvais slug → `notFound()` (404, pas 401 révélateur)
   - aucun lien public, exclu sitemap/robots, noindex
   - l’obscurité est un filet en PLUS de l’auth session (httpOnly, Secure, SameSite, rate-limit)
3. Couches : domain → application (use-cases) → infrastructure → app UI.
4. SOLID + Zod aux frontières + pas de PII dans les logs.
5. PostgreSQL via Docker Compose (volume + healthcheck) + Prisma (migrations).
6. Auth mono-utilisateur solide — usage perso au MVP.
7. Pas de Stripe obligatoire au MVP : paiements manuels ; interface IPaymentGateway pour plus tard (OCP).
8. Pas d’agents IA / Gmail dans cette phase (points d’extension seulement).

LIVRABLES TECHNIQUES
A. Infra
   - docker-compose.yml (service postgres)
   - .env.example avec `DASHBOARD_BASE_PATH=change-me-to-a-long-random-slug` + DATABASE_URL + AUTH secrets
   - Ne jamais mettre le vrai slug dans le README public (placeholder uniquement)
   - Prisma schema + première migration
   - scripts npm : db:up, db:migrate, db:seed (données fictives uniquement)

B. Schéma minimal (adapte les noms, garde le sens)
   - User (admin)
   - Client (identité, email, téléphone?, adresse facturation, notes internes, deletedAt, consent flags)
   - CatalogOffer (setup / essentiel / serenite / premium / custom) — seed depuis pricing
   - Quote + QuoteLine (statuts draft|sent|accepted|rejected|expired)
   - Invoice + InvoiceLine (n° séquentiel, statuts draft|issued|partially_paid|paid|overdue|cancelled)
   - Subscription (clientId, offer, priceCents, start/end, status active|paused|cancelled)
   - Payment (invoiceId, amountCents, method, paidAt, reference, status)
   - AuditLog léger (qui / quoi / quand) sans payload PII superflu

C. Fonctionnalités UI sous `/${DASHBOARD_BASE_PATH}`
   - Login / logout (ex. `/${slug}/signin` — pas `/login` global)
   - Home : KPIs (CA du mois, factures en retard, devis en attente, abonnements actifs)
   - Clients : CRUD, fiche client (devis / factures / abo liés)
   - Devis : créer depuis client + lignes, envoyer (statut), accepter → “générer facture”
   - Factures : émettre, marquer payée / partielle, PDF téléchargeable (mentions FR basiques)
   - Paiements : liste + rattachement facture
   - Abonnements : lier client + offre + dates ; prochaines échéances
   - Recherche / filtres + états vides
   - Design cohérent (Tailwind, ton pro, FR) — pas de thème purple générique AI

D. Qualité
   - TypeScript strict, pas de `any` gratuit
   - Tests unitaires au minimum sur : calcul totaux TTC, transitions de statuts, numérotation facture
   - README section “Dashboard” : démarrage Docker + migrate + seed + login demo
   - .gitignore à jour (.env, node_modules, etc.)

ORDRE D’EXÉCUTION (obligatoire)
1. Plan court (fichiers / schéma) — puis implémenter
2. Docker + Prisma + seed
3. Domain + use-cases (sans UI)
4. Auth + validation du slug secret (`DASHBOARD_BASE_PATH`)
5. UI pages une par une (clients → devis → factures → paiements → abonnements → home KPIs)
6. PDF facture
7. README + vérification lint/build

HORS SCOPE (ne pas faire maintenant)
- Multi-utilisateur / rôles avancés
- Stripe Checkout / webhooks
- Envoi email transactionnel automatique (prévoir interface IMailer seulement)
- Agents IA, sync Gmail, todos
- Refonte du site marketing

CRITERES DE DONE
- `docker compose up -d` + migrate + seed OK
- Connexion via `/${DASHBOARD_BASE_PATH}/...` uniquement ; `/admin` n’existe pas (404)
- Cycle OK : client → devis → acceptation → facture → paiement
- Une facture PDF se télécharge
- Rules SOLID/RGPD/DB respectées ; slug absent du README public
- Le site public continue de build

Commence par le plan + docker-compose + schema Prisma, puis enchaîne.
```

---

## Phases suivantes (ne pas coller maintenant)

| Phase | Prompt futur |
|-------|----------------|
| 2 | Relances + échéancier abo + export compta CSV |
| 3 | Stripe + `IPaymentGateway` |
| 4 | `IMailer` (devis/facture par email) |
| 5 | Agents IA (Gmail → todos) — app perso |

## Comment utiliser

1. Vérifier que `.cursor/rules/` est bien présent (déjà créé).
2. Ouvrir un **nouveau** Agent chat.
3. Coller le bloc « Prompt à copier ».
4. Laisser l’agent suivre l’ordre d’exécution ; rappeler les rules si dérive.
