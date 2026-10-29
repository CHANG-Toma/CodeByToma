import { notFound } from "next/navigation";

/**
 * Valide le segment d'URL secret. Mauvais slug → 404 (pas 401 révélateur).
 */
export function getDashboardBasePath(): string {
  const raw = process.env.DASHBOARD_BASE_PATH?.trim() ?? "";
  return raw.replace(/^\/+|\/+$/g, "");
}

export function assertValidDashboardSlug(slug: string): void {
  const expected = getDashboardBasePath();
  if (!expected || expected === "change-me-to-a-long-random-slug") {
    // Misconfiguration : on ne révèle rien en prod, 404 partout
    notFound();
  }
  if (slug !== expected) {
    notFound();
  }
}

export function dashboardHref(slug: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${slug}/${clean}` : `/${slug}`;
}
