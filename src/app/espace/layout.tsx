import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/dashboard/PortalShell";
import { getSession } from "@/server/infrastructure/auth/session";

export const metadata: Metadata = {
  title: "Espace client",
  robots: { index: false, follow: false },
};

type Props = { children: React.ReactNode };

export default async function EspaceLayout({ children }: Props) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role !== "client" || !session.clientId) {
    redirect("/connexion");
  }

  return <PortalShell>{children}</PortalShell>;
}
