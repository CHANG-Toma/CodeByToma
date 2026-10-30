"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  overHero?: boolean;
};

const ThemeToggle = ({ overHero = false }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
        overHero
          ? "border-[color:var(--cbt-nav-control-border)] text-[color:var(--cbt-nav-control-fg)] hover:border-cbtBorderStrong hover:text-[color:var(--cbt-nav-fg-strong)]"
          : "border-cbtBorder text-mist hover:border-cbtBorderStrong hover:text-snow"
      )}
      aria-label={
        mounted
          ? isDark
            ? "Passer en mode clair"
            : "Passer en mode sombre"
          : "Changer de thème"
      }
      title={
        mounted ? (isDark ? "Mode clair" : "Mode sombre") : "Changer de thème"
      }
      suppressHydrationWarning
    >
      <Sun
        className={cn(
          "h-3.5 w-3.5",
          isDark ? "block" : "hidden"
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <Moon
        className={cn(
          "h-3.5 w-3.5",
          isDark ? "hidden" : "block"
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
};

export default ThemeToggle;
