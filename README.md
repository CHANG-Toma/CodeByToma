# Portfolio - CHANG Toma / CodeByToma

Portfolio personnel et site marketing public, avec un **dashboard privé** pour gérer l'activité solo (clients, devis, factures, abonnements, paiements).

## Technologies

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/) + Shadcn/ui
- PostgreSQL (Docker) + Prisma
- Vitest (tests domaine)

## Site public

```bash
npm install
npm run dev
```

Pages marketing : `/`, `/portfolio`, `/demo/*`. SEO via `sitemap` / `robots` — le dashboard n’y figure pas.

## Dashboard (privé)

Le dashboard est monté sous un **chemin secret** défini par `DASHBOARD_BASE_PATH` (sans slash).  
Exemple de configuration locale : voir `.env.example` (`change-me-to-a-long-random-slug`).

> Ne jamais committer le vrai slug. Pas d’URL `/admin`, `/dashboard` ou `/login` globale.

### Prérequis

- Docker (PostgreSQL)
- Node.js 20+

### Démarrage

```bash
cp .env.example .env
# Éditer .env : DASHBOARD_BASE_PATH, AUTH_SECRET (32+ car.), AUTH_ADMIN_*

npm install
npm run db:up
npx prisma migrate dev
npm run db:seed
npm run dev
```

Puis ouvrir :

`http://localhost:3000/<DASHBOARD_BASE_PATH>/signin`

### Compte démo (seed)

- E-mail : valeur de `AUTH_ADMIN_EMAIL` (défaut `admin@example.com`)
- Mot de passe : valeur de `AUTH_ADMIN_PASSWORD` (défaut conforme à la politique ≥12 car. dans `.env.example`)

Données seed : clients / devis **fictifs** uniquement (`@exemple-demo.fr`).

Page publique confidentialité : `/confidentialite`.

### Scripts utiles

| Script | Rôle |
|--------|------|
| `npm run db:up` | Démarre Postgres (Docker Compose) |
| `npm run db:migrate` | Applique les migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Catalogue offres + admin + démos |
| `npm test` | Tests unitaires (totaux, statuts, n° facture) |

### Cycle métier MVP

Client → devis → envoi → acceptation → facture → paiement (manuel) → PDF téléchargeable.

Paiements Stripe / e-mails transactionnels / agents IA : hors scope Phase 1 (ports `IPaymentGateway`, `IMailer` prêts).

## Contact

- Site : [CodeByToma.dev](https://codebytoma.me)
- LinkedIn : [CHANG Toma](https://www.linkedin.com/in/toma-chang/)
- GitHub : [@CHANG-Toma](https://github.com/CHANG-Toma)

## License

MIT — voir [LICENSE.md](LICENSE.md) si présent.
