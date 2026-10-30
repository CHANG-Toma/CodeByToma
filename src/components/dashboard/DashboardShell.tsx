import {
  DashboardMobileNav,
  DashboardSidebar,
} from "@/components/dashboard/DashboardNav";
import { deps } from "@/server/application/container";
import { getSession } from "@/server/infrastructure/auth/session";

type Props = {
  slug: string;
  children: React.ReactNode;
};

export async function DashboardShell({ slug, children }: Props) {
  const session = await getSession();
  const user = session ? await deps.users.findById(session.sub) : null;
  const displayName = user?.name ?? "CodeByToma";

  return (
    <div className="dashboard-theme min-h-screen">
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, var(--dash-glow), transparent 55%)",
        }}
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
    </div>
  );
}
