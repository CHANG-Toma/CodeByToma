"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

type DeleteResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string };

type Props = {
  confirmMessage: string;
  label?: string;
  performDelete: () => Promise<DeleteResult>;
  onDeleted?: (result: { clientId: string }) => void;
  successRedirect?: string;
  className?: string;
};

const dangerBtnClass =
  "inline-flex items-center justify-center rounded-md border border-rose-500/40 px-4 py-2 text-sm text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 active:translate-y-0 disabled:opacity-60 motion-reduce:transform-none dark:text-rose-300";

export function DeleteWithConfirm({
  confirmMessage,
  label = "Supprimer",
  performDelete,
  onDeleted,
  successRedirect,
  className,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(dangerBtnClass, className)}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await performDelete();
          if (!result.ok) {
            window.alert(result.error);
            return;
          }
          if (onDeleted) {
            onDeleted({ clientId: result.clientId });
          } else if (successRedirect) {
            router.push(successRedirect);
            router.refresh();
          } else {
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Suppression…" : label}
    </button>
  );
}
