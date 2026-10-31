"use client";

import { useState } from "react";

type Props = {
  mailtoHref: string;
  subject: string;
  text: string;
};

export function TodayActionReminderActions({
  mailtoHref,
  subject,
  text,
}: Props) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={mailtoHref}
        className="rounded-md border border-dash-border px-3 py-1.5 text-xs text-dash-soft transition hover:bg-dash-hover"
      >
        Mail
      </a>
      <button
        type="button"
        onClick={() => void copyMessage()}
        className="rounded-md border border-dash-border px-3 py-1.5 text-xs text-dash-soft transition hover:bg-dash-hover"
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
