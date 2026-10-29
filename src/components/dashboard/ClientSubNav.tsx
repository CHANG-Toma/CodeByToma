"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  Receipt,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

export type ClientTabCounts = {
  quotes: number;
  invoices: number;
  payments: number;
  subscriptions: number;
};

type Props = {
  slug: string;
  clientId: string;
  counts: ClientTabCounts;
};

const TABS = [
  {
    key: "quotes",
    href: "quotes",
    label: "Devis",
    icon: FileText,
    countKey: "quotes" as const,
  },
  {
    key: "invoices",
    href: "invoices",
    label: "Factures",
    icon: Receipt,
    countKey: "invoices" as const,
  },
  {
    key: "payments",
    href: "payments",
    label: "Paiements",
    icon: CreditCard,
    countKey: "payments" as const,
  },
  {
    key: "subscriptions",
    href: "subscriptions",
    label: "Abonnements",
    icon: RefreshCw,
    countKey: "subscriptions" as const,
  },
  { key: "overview", href: "overview", label: "Fiche", icon: UserRound },
] as const;

function isTabActive(
  pathname: string,
  slug: string,
  clientId: string,
  tabHref: string,
): boolean {
  const base = `/${slug}/clients/${clientId}`;
  const target = `${base}/${tabHref}`;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function ClientSubNav({ slug, clientId, counts }: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections client"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-dash-border pb-px"
    >
      {TABS.map((tab) => {
        const active = isTabActive(pathname, slug, clientId, tab.href);
        const Icon = tab.icon;
        const count =
          "countKey" in tab && tab.countKey ? counts[tab.countKey] : undefined;
        const href = dashboardHref(slug, `clients/${clientId}/${tab.href}`);

        return (
          <Link
            key={tab.key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] transition",
              active
                ? "border-dash-accent font-medium text-dash-text"
                : "border-transparent text-dash-muted hover:text-dash-text",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {tab.label}
            {typeof count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                  active
                    ? "bg-dash-active text-dash-text"
                    : "bg-dash-hover text-dash-muted2",
                )}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
