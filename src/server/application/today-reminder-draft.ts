import {
  buildMailtoHref,
  buildReminderDraft,
  type ReminderKind,
} from "@/server/domain/reminder-templates";
import type { TodayActionKind } from "@/server/domain/today-actions";

function issuerName(): string {
  return process.env.INVOICE_ISSUER_NAME?.trim() || "CodeByToma";
}

export function buildTodayReminderDraft(input: {
  kind: TodayActionKind;
  clientName: string;
  clientEmail: string;
  documentNumber: string;
  amountCents: number;
  dueOrValidUntil: Date | null;
}): { mailtoHref: string; subject: string; text: string } | undefined {
  const remindable =
    input.kind === "invoice_overdue" ||
    input.kind === "quote_follow_up" ||
    input.kind === "quote_expired" ||
    input.kind === "quote_expiring";
  if (!remindable) return undefined;

  const draft = buildReminderDraft({
    kind: input.kind as ReminderKind,
    clientName: input.clientName,
    documentNumber: input.documentNumber,
    amountCents: input.amountCents,
    dueOrValidUntil: input.dueOrValidUntil,
    issuerName: issuerName(),
  });
  return {
    ...draft,
    mailtoHref: buildMailtoHref(input.clientEmail, draft.subject, draft.text),
  };
}
