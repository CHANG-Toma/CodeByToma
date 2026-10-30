"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";

type Props = {
  subject: string | null;
  body: string | null;
};

export function AssistantDraftPanel({ subject, body }: Props) {
  const [copied, setCopied] = useState(false);
  const draft = [subject ? `Objet : ${subject}` : null, body]
    .filter(Boolean)
    .join("\n\n");

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="group/draft rounded-lg border border-dash-border bg-dash-input/35">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-dash-soft transition hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dash-btn [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <Mail className="h-4 w-4 text-dash-muted" aria-hidden />
          Brouillon de message
        </span>
        <span className="text-xs font-normal text-dash-muted group-open/draft:hidden">
          Afficher
        </span>
        <span className="hidden text-xs font-normal text-dash-muted group-open/draft:inline">
          Masquer
        </span>
      </summary>

      <div className="border-t border-dash-border px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          {subject ? (
            <p className="text-sm font-medium text-dash-text">
              Objet : {subject}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={copyDraft}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-dash-border px-2.5 py-1.5 text-xs text-dash-soft transition hover:-translate-y-0.5 hover:bg-dash-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-btn motion-reduce:transform-none"
            aria-label="Copier l’objet et le message"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        {body ? (
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-dash-soft">
            {body}
          </pre>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {copied ? "Le brouillon a été copié." : ""}
        </p>
      </div>
    </details>
  );
}
