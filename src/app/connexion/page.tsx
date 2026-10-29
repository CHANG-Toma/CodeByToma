import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginShell } from "@/components/dashboard/LoginShell";
import {
  dashboardHref,
  getDashboardBasePath,
} from "@/server/infrastructure/auth/dashboard-path";
import { getSession } from "@/server/infrastructure/auth/session";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage() {
  const session = await getSession();
  if (session) {
    const slug = getDashboardBasePath();
    if (slug) redirect(dashboardHref(slug));
  }

  return (
    <LoginShell
      subtitle="Espace réservé aux clients CodeByToma."
      showPublicLinks
    />
  );
}
