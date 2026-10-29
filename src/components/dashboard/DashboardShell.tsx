import Link from "next/link";
import { signOutAction } from "@/app/(private)/actions";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

const NAV = [
  { href: "", label: "Accueil" },
  { href: "clients", label: "Clients" },
  { href: "quotes", label: "Devis" },
  { href: "invoices", label: "Factures" },
  { href: "payments", label: "Paiements" },
  { href: "subscriptions", label: "Abonnements" },
] as const;

type Props = {
  slug: string;
  email: string;
  children: React.ReactNode;
};

export function DashboardShell({ slug, email, children }: Props) {
  return (
    <div className="min-h-screen bg-[#0e141c] text-[#e8edf4]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,90,135,0.18),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-0 md:gap-8">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 p-6 md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8fa0b5]">
            CodeByToma
          </p>
          <p className="mt-1 text-lg font-semibold text-white">Studio</p>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={dashboardHref(slug, item.href)}
                className="rounded-md px-3 py-2 text-sm text-[#c5d0de] transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction} className="mt-10">
            <button
              type="submit"
              className="text-xs text-[#8fa0b5] underline-offset-2 hover:text-white hover:underline"
            >
              Déconnexion ({email})
            </button>
          </form>
        </aside>

        <div className="flex-1 px-4 py-6 md:px-2 md:py-8">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 md:hidden">
            <p className="font-semibold text-white">Studio CodeByToma</p>
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-[#8fa0b5]">
                Déconnexion
              </button>
            </form>
          </header>
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={dashboardHref(slug, item.href)}
                className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#c5d0de]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
