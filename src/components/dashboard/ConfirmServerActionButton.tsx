"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type Props = {
  confirmMessage: string;
  label: string;
  action: () => Promise<void>;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
};

const primaryClass =
  "inline-flex items-center justify-center rounded-md bg-dash-btn px-4 py-2 text-sm font-medium text-dash-on-btn transition hover:bg-dash-btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn disabled:opacity-60";

const secondaryClass =
  "inline-flex items-center justify-center rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft transition hover:-translate-y-0.5 hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn active:translate-y-0 disabled:opacity-60 motion-reduce:transform-none";

export function ConfirmServerActionButton({
  confirmMessage,
  label,
  action,
  pendingLabel,
  variant = "secondary",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(variant === "primary" ? primaryClass : secondaryClass)}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      {pending ? (pendingLabel ?? `${label}…`) : label}
    </button>
  );
}
