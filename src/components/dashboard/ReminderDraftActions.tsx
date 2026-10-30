"use client";

import { useState } from "react";

type Props = {
  mailtoHref: string;
  subject: string;
  text: string;
  markSentAction: () => Promise<void>;
};

export function ReminderDraftActions({
  mailtoHref,
  subject,
  text,
  markSentAction,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [marked, setMarked] = useState(false);

  async function copyMessage() {
    const payload = `${subject}\n\n${text}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function markSent() {
    await markSentAction();
    setMarked(true);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={mailtoHref}
        className="inline-flex items-center justify-center rounded-md bg-dash-btn px-4 py-2 text-sm font-medium text-dash-on-btn transition hover:bg-dash-btn-hover"
      >
        Ouvrir dans la messagerie
      </a>
      <button
        type="button"
        onClick={() => void copyMessage()}
        className="inline-flex items-center justify-center rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft transition hover:bg-dash-hover"
      >
        {copied ? "Copié" : "Copier le message"}
      </button>
      <button
        type="button"
        onClick={() => void markSent()}
        disabled={marked}
        className="inline-flex items-center justify-center rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft transition hover:bg-dash-hover disabled:opacity-60"
      >
        {marked ? "Relance notée" : "Marquer comme relancé"}
      </button>
    </div>
  );
}
