"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  collapsed?: boolean;
  className?: string;
};

export function DashboardThemeToggle({ collapsed, className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-dash-muted transition hover:bg-dash-hover hover:text-dash-text",
        collapsed && "justify-center px-2",
        className,
      )}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      )}
      {!collapsed ? (
        <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
      ) : null}
    </button>
  );
}
