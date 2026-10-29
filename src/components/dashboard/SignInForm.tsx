"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/(private)/actions";
import { Field, PrimaryButton } from "./ui";

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, {
    ok: false,
  });

  return (
    <form action={action} className="space-y-4">
      <Field label="E-mail" name="email" type="email" required />
      <Field label="Mot de passe" name="password" type="password" required />
      {!state.ok && state.error ? (
        <p className="text-sm text-rose-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <PrimaryButton type="submit">
        {pending ? "Connexion…" : "Se connecter"}
      </PrimaryButton>
    </form>
  );
}
