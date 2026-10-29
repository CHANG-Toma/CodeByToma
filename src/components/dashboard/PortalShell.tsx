import {
  PortalMobileNav,
  PortalSidebar,
} from "@/components/dashboard/PortalNav";

type Props = {
  children: React.ReactNode;
};

export function PortalShell({ children }: Props) {
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
        <PortalSidebar />
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <PortalMobileNav />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
