import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { assertValidDashboardSlug } from "@/server/infrastructure/auth/dashboard-path";
import { getSession } from "@/server/infrastructure/auth/session";

type Props = {
  children: React.ReactNode;
  params: Promise<{ dashboardSlug: string }>;
};

export default async function DashboardAppLayout({ children, params }: Props) {
  const { dashboardSlug } = await params;
  assertValidDashboardSlug(dashboardSlug);

  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }

  return (
    <DashboardShell slug={dashboardSlug}>{children}</DashboardShell>
  );
}
