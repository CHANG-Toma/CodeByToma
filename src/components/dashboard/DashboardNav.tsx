"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  RefreshCw,
  Users,
} from "lucide-react";
import { DashboardThemeToggle } from "@/components/dashboard/DashboardThemeToggle";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { cn } from "@/lib/utils";
import { dashboardHref } from "@/lib/dashboard-href";

const SIDEBAR_KEY = "cbt-dashboard-sidebar-collapsed";

const NAV = [
  { href: "", label: "Accueil", icon: LayoutDashboard },
  { href: "clients", label: "Clients", icon: Users },
  { href: "quotes", label: "Devis", icon: FileText },
  { href: "invoices", label: "Factures", icon: Receipt },
  { href: "payments", label: "Paiements", icon: CreditCard },
  { href: "subscriptions", label: "Abonnements", icon: RefreshCw },
] as const;

type Props = {
  slug: string;
  displayName?: string | null;
};

function isActive(pathname: string, slug: string, href: string): boolean {
  const base = `/${slug}`;
  const target = href ? `${base}/${href}` : base;
  if (!href) {
    return pathname === base || pathname === `${base}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function DashboardSidebar({ slug, displayName }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-dash-border bg-dash-sidebar px-2.5 py-4 shadow-[1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-md transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
        !ready && "opacity-0",
      )}
    >
      <div
        className={cn(
          "mb-6 flex items-center gap-2",
          collapsed ? "flex-col gap-3 px-0" : "px-1.5",
        )}
      >
        <ProfileMenu
          slug={slug}
          collapsed={collapsed}
          displayName={displayName}
        />

        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dash-muted transition hover:bg-dash-hover hover:text-dash-text",
            !collapsed && "ml-auto",
          )}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          aria-expanded={!collapsed}
          title={collapsed ? "Déplier" : "Replier"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {!collapsed ? (
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-dash-muted2">
          Menu
        </p>
      ) : (
        <div className="mb-2 h-px w-8 self-center bg-dash-border" />
      )}

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(pathname, slug, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href || "home"}
              href={dashboardHref(slug, item.href)}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg py-2 text-[13px] transition",
                collapsed ? "justify-center px-2" : "px-3",
                active
                  ? "border-l-2 border-l-dash-accent bg-dash-active font-medium text-dash-text"
                  : "text-dash-muted hover:bg-dash-hover hover:text-dash-text",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition",
                  active
                    ? "text-dash-soft"
                    : "text-dash-muted2 group-hover:text-dash-muted",
                )}
                aria-hidden
              />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 space-y-1 border-t border-dash-border pt-3">
        <DashboardThemeToggle collapsed={collapsed} />
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ slug, displayName }: Props) {
  const pathname = usePathname();

  return (
    <div className="mb-6 md:hidden">
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-dash-border pb-4">
        <ProfileMenu slug={slug} displayName={displayName} />
        <DashboardThemeToggle collapsed />
      </header>
      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {NAV.map((item) => {
          const active = isActive(pathname, slug, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href || "home"}
              href={dashboardHref(slug, item.href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] transition",
                active
                  ? "bg-dash-active font-medium text-dash-text"
                  : "border border-dash-border text-dash-muted",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
