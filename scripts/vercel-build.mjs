/**
 * Build Vercel : migrations Prisma uniquement en production.
 *
 * Les previews partagent souvent la même DATABASE_URL Neon que la prod.
 * Lancer migrate deploy sur une preview appliquerait le schéma d’une branche
 * feature sur la BDD prod avant que le code prod correspondant soit déployé.
 * On limite donc migrate deploy à VERCEL_ENV=production.
 */
import { execSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV;

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

if (vercelEnv === "production") {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "[build] DATABASE_URL est requis pour migrate deploy en production.",
    );
    process.exit(1);
  }
  console.log("[build] Production — prisma migrate deploy…");
  run("npx prisma migrate deploy");
} else {
  console.log(
    `[build] Migration ignorée (VERCEL_ENV=${vercelEnv ?? "non défini"}). ` +
      "Les previews et builds locaux n’appliquent pas les migrations.",
  );
}

console.log("[build] next build…");
run("npx next build");
