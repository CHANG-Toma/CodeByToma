"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOutAction } from "@/app/(private)/actions";
import { cn } from "@/lib/utils";
import { SITE_LOGO } from "@/lib/seo";
import { dashboardHref } from "@/lib/dashboard-href";

type Props = {
  slug: string;
  collapsed?: boolean;
  displayName?: string | null;
};

type MenuPos = { top: number; left: number };

export function ProfileMenu({ slug, collapsed = false, displayName }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = displayName?.trim() || "CodeByToma";

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 200;
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - menuWidth - 8,
      );
      setPos({ top: rect.bottom + 6, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menu =
    mounted && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{ top: pos.top, left: pos.left, width: 200 }}
            className="dashboard-theme fixed z-[200] overflow-hidden rounded-md border border-dash-border bg-dash-surface py-1 shadow-xl shadow-black/40"
          >
            <div className="border-b border-dash-border px-3 py-2">
              <p className="truncate text-sm font-medium text-dash-text">
                {label}
              </p>
              <p className="text-[11px] text-dash-muted2">Compte studio</p>
            </div>
            <Link
              href={dashboardHref(slug, "profil")}
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-sm text-dash-soft hover:bg-dash-hover hover:text-dash-text"
              onClick={() => setOpen(false)}
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              Mes infos
            </Link>
            <form action={signOutAction} role="none">
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dash-soft hover:bg-dash-hover hover:text-dash-text"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Déconnexion
              </button>
            </form>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu profil"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3d6a9a]/40",
          collapsed ? "justify-center" : "flex-1",
        )}
        title="Profil"
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
          <>
            <span className="min-w-0 text-left">
              <span className="block truncate text-[13px] font-semibold tracking-tight text-dash-text">
                {label}
              </span>
              <span className="block text-[11px] text-dash-muted2">
                Studio
              </span>
            </span>
            <ChevronDown
              className={cn(
                "ml-auto h-3.5 w-3.5 shrink-0 text-dash-muted2 transition",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        ) : null}
      </button>
      {menu}
    </>
  );
}
