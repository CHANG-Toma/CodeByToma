"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { signOutAction } from "@/app/(private)/actions";
import { DashboardThemeToggle } from "@/components/dashboard/DashboardThemeToggle";
import { cn } from "@/lib/utils";
import { SITE_LOGO } from "@/lib/seo";

const SIDEBAR_KEY = "cbt-portal-sidebar-collapsed";

const NAV = [
  { href: "/espace", label: "Accueil", icon: Home },
  { href: "/espace/devis", label: "Devis", icon: FileText },
  { href: "/espace/factures", label: "Factures", icon: Receipt },
  { href: "/espace/abonnements", label: "Abonnements", icon: RefreshCw },
  { href: "/espace/profil", label: "Profil", icon: UserRound },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/espace") {
    return pathname === "/espace" || pathname === "/espace/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalSidebar() {
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
        <Link
          href="/espace"
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3d6a9a]/40",
            collapsed && "justify-center",
          )}
          title="Accueil"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f2f4f7] ring-1 ring-dash-border">
            <Image
              src={SITE_LOGO.url}
              alt=""
              fill
              sizes="36px"
              className="scale-[1.38] object-cover object-center"
              priority
            />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold tracking-tight text-dash-text">
                CodeByToma
              </span>
              <span className="block text-[11px] text-dash-muted2">
                Espace client
              </span>
            </span>
          ) : null}
        </Link>

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
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <form action={signOutAction}>
          <button
            type="submit"
            title="Déconnexion"
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg py-2 text-[12px] text-dash-muted transition hover:bg-dash-hover hover:text-dash-text",
              collapsed ? "justify-center px-2" : "px-3",
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {!collapsed ? <span>Déconnexion</span> : null}
          </button>
        </form>
      </div>
    </aside>
  );
}

export function PortalMobileNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 md:hidden">
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-dash-border pb-4">
        <Link href="/espace" className="flex items-center gap-2">
          <span className="relative h-8 w-8 overflow-hidden rounded-full bg-[#f2f4f7]">
            <Image
              src={SITE_LOGO.url}
              alt=""
              fill
              sizes="32px"
              className="scale-[1.38] object-cover object-center"
            />
          </span>
          <span className="text-sm font-semibold text-dash-text">
            Espace client
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <DashboardThemeToggle collapsed />
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg px-2 py-2 text-[11px] text-dash-muted"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
