"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/app/(private)/actions";
import { Field, PrimaryButton } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit">
      {pending ? "Connexion…" : "Se connecter"}
    </PrimaryButton>
  );
}

export function SignInForm() {
  const [state, action] = useFormState(signInAction, {
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
      <SubmitButton />
    </form>
  );
}
