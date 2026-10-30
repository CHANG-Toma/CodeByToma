"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type RowActionLink = {
  kind: "link";
  label: string;
  href: string;
};

export type RowActionButton = {
  kind: "button";
  label: string;
  formAction: () => void | Promise<void>;
  tone?: "default" | "danger";
};

export type RowAction = RowActionLink | RowActionButton;

const itemClass =
  "flex w-full items-center px-3 py-2 text-left text-sm transition";

const MENU_WIDTH = 184;
const MENU_GAP = 4;
const VIEW_PAD = 8;

type MenuPos = { top: number; left: number };

export function RowActions({ actions }: { actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function place() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const estimatedHeight = actions.length * 36 + 8;
      const spaceBelow = window.innerHeight - rect.bottom - VIEW_PAD;
      const openUp =
        spaceBelow < estimatedHeight && rect.top > spaceBelow + estimatedHeight;

      const top = openUp
        ? Math.max(VIEW_PAD, rect.top - estimatedHeight - MENU_GAP)
        : rect.bottom + MENU_GAP;

      const left = Math.min(
        Math.max(VIEW_PAD, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - VIEW_PAD,
      );

      setPos({ top, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, actions.length]);

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

  if (actions.length === 0) {
    return <td className="px-5 py-3" />;
  }

  const menu =
    mounted && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
            className={cn(
              // Re-apply theme tokens: portal is outside .dashboard-theme
              "dashboard-theme fixed z-[200] overflow-hidden rounded-md border border-dash-border bg-dash-surface py-1 shadow-xl shadow-black/40",
            )}
          >
            {actions.map((action) => {
              if (action.kind === "link") {
                return (
                  <Link
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    role="menuitem"
                    className={cn(
                      itemClass,
                      "text-dash-soft hover:bg-dash-hover hover:text-dash-text",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <form
                  key={action.label}
                  action={action.formAction}
                  role="none"
                >
                  <button
                    type="submit"
                    role="menuitem"
                    className={cn(
                      itemClass,
                      action.tone === "danger"
                        ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                        : "text-dash-soft hover:bg-dash-hover hover:text-dash-text",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {action.label}
                  </button>
                </form>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <td className="px-5 py-3 text-right">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-dash-muted transition hover:bg-dash-hover hover:text-dash-text"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {menu}
    </td>
  );
}

export function RowActionsHeader() {
  return (
    <th className="w-14 px-5 py-3 text-right font-medium">
      <span className="sr-only">Actions</span>
    </th>
  );
}
