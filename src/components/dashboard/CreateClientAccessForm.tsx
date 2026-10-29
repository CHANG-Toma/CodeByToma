"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createClientAccessAction } from "@/app/(private)/actions";
import { Field, PrimaryButton } from "@/components/dashboard/ui";

type Props = {
  clientId: string;
  defaultEmail: string;
  defaultName: string;
};

type State = { ok: boolean; error?: string; success?: string } | null;

export function CreateClientAccessForm({
  clientId,
  defaultEmail,
  defaultName,
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      return createClientAccessAction(formData);
    },
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="grid max-w-lg gap-4 sm:grid-cols-2">
      <input type="hidden" name="clientId" value={clientId} />
      <Field
        label="E-mail de connexion"
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
      />
      <Field label="Nom affiché" name="name" defaultValue={defaultName} />
      <div className="sm:col-span-2">
        <Field
          label="Mot de passe temporaire"
          name="password"
          type="password"
          required
          placeholder="12+ car., majuscule, minuscule, chiffre"
        />
      </div>
      {state?.error ? (
        <p className="sm:col-span-2 text-sm text-rose-600 dark:text-rose-300">
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.success ? (
        <p className="sm:col-span-2 text-sm text-emerald-700 dark:text-emerald-300">
          {state.success}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <PrimaryButton>{pending ? "Création…" : "Créer l'accès"}</PrimaryButton>
      </div>
    </form>
  );
}
