import {
  DashboardMobileNav,
  DashboardSidebar,
} from "@/components/dashboard/DashboardNav";
import { NoriPresence } from "@/components/dashboard/NoriPresence";
import { deps } from "@/server/application/container";
import { getNoriSummary } from "@/server/application/nori-summary";
import { getSession } from "@/server/infrastructure/auth/session";

type Props = {
  slug: string;
  children: React.ReactNode;
};

export async function DashboardShell({ slug, children }: Props) {
  const session = await getSession();
  const [user, noriSummary] = await Promise.all([
    session ? deps.users.findById(session.sub) : null,
    getNoriSummary(),
  ]);
  const displayName = user?.name ?? "CodeByToma";

  return (
    <div className="dashboard-theme min-h-screen">
      <div
        className="dashboard-ambient pointer-events-none fixed inset-0"
        aria-hidden
      />
      <div className="relative flex min-h-screen">
        <DashboardSidebar slug={slug} displayName={displayName} />
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <DashboardMobileNav slug={slug} displayName={displayName} />
            {children}
          </div>
        </div>
      </div>
      <NoriPresence slug={slug} summary={noriSummary} />
    </div>
  );
}
