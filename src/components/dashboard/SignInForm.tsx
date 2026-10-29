"use client";

import { useActionState, useId, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from "lucide-react";
import { signInAction } from "@/app/(private)/actions";
import { cn } from "@/lib/utils";

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, {
    ok: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  return (
    <form action={action} className="space-y-5" noValidate>
      {!state.ok && state.error ? (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-100"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor={emailId}
          className="block text-[13px] font-medium text-[#a8b2c1]"
        >
          E-mail
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7d]"
            aria-hidden
          />
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? errorId : undefined}
            placeholder="vous@exemple.fr"
            className={cn(
              "w-full rounded-lg border border-white/12 bg-[#0b1017] py-2.5 pl-10 pr-3 text-[15px] text-white",
              "outline-none transition placeholder:text-[#4b5868]",
              "focus:border-[#3d6a9a]/60 focus:ring-2 focus:ring-[#2d5a87]/35",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={passwordId}
          className="block text-[13px] font-medium text-[#a8b2c1]"
        >
          Mot de passe
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c6b7d]"
            aria-hidden
          />
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            aria-describedby={state.error ? errorId : undefined}
            placeholder="••••••••••••"
            className={cn(
              "w-full rounded-lg border border-white/12 bg-[#0b1017] py-2.5 pl-10 pr-11 text-[15px] text-white",
              "outline-none transition placeholder:text-[#4b5868]",
              "focus:border-[#3d6a9a]/60 focus:ring-2 focus:ring-[#2d5a87]/35",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={pending}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#8fa0b5] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg",
          "bg-[#e8edf4] px-4 py-2.5 text-[14px] font-semibold text-[#0e141c]",
          "transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fa0b5]",
          "disabled:cursor-wait disabled:opacity-80",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Connexion…
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
