import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginShell } from "@/components/dashboard/LoginShell";
import { getDashboardBasePath } from "@/server/infrastructure/auth/dashboard-path";
import { getSession } from "@/server/infrastructure/auth/session";
import { postLoginPath } from "@/server/domain/roles";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage() {
  const session = await getSession();
  if (session) {
    redirect(postLoginPath(session.role, getDashboardBasePath()));
  }

  return (
    <LoginShell
      subtitle="Connexion à votre espace CodeByToma."
      showPublicLinks
    />
  );
}
