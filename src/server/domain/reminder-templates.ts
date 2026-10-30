import { formatEur } from "@/lib/money";

export type ReminderKind =
  | "quote_follow_up"
  | "quote_expired"
  | "quote_expiring"
  | "invoice_overdue";

export type ReminderDraftInput = {
  kind: ReminderKind;
  clientName: string;
  documentNumber: string;
  amountCents: number;
  dueOrValidUntil: Date | null;
  issuerName: string;
};

export type ReminderDraft = {
  kind: ReminderKind;
  subject: string;
  text: string;
};

function dateFr(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR");
}

/**
 * Templates FR — pas d’IA. Tu édites avant envoi.
 */
export function buildReminderDraft(input: ReminderDraftInput): ReminderDraft {
  const amount = formatEur(input.amountCents);
  const when = dateFr(input.dueOrValidUntil);
  const hello = `Bonjour ${input.clientName},`;
  const sign = `Cordialement,\n${input.issuerName}`;

  switch (input.kind) {
    case "quote_follow_up":
      return {
        kind: input.kind,
        subject: `Relance — devis ${input.documentNumber}`,
        text: [
          hello,
          "",
          `Je me permets de revenir vers vous concernant le devis ${input.documentNumber} (${amount}).`,
          "Avez-vous pu en prendre connaissance ? Je reste disponible pour en discuter ou l’ajuster.",
          "",
          sign,
        ].join("\n"),
      };
    case "quote_expiring":
      return {
        kind: input.kind,
        subject: `Devis ${input.documentNumber} — validité bientôt expirée`,
        text: [
          hello,
          "",
          `Le devis ${input.documentNumber} (${amount})${when ? ` est valable jusqu’au ${when}` : " arrive en fin de validité"}.`,
          "Si vous souhaitez avancer, répondez simplement à ce message — je peux aussi adapter le périmètre.",
          "",
          sign,
        ].join("\n"),
      };
    case "quote_expired":
      return {
        kind: input.kind,
        subject: `Devis ${input.documentNumber} — validité expirée`,
        text: [
          hello,
          "",
          `Le devis ${input.documentNumber} (${amount})${when ? ` n’est plus valable depuis le ${when}` : " n’est plus valable"}.`,
          "Souhaitez-vous que je vous en renvoie une version à jour ?",
          "",
          sign,
        ].join("\n"),
      };
    case "invoice_overdue":
      return {
        kind: input.kind,
        subject: `Relance — facture ${input.documentNumber}`,
        text: [
          hello,
          "",
          `Sauf erreur de ma part, la facture ${input.documentNumber} (${amount})${when ? `, échéance au ${when},` : ""} reste en attente de règlement.`,
          "Pouvez-vous me confirmer la réception du paiement, ou me dire si un élément bloque ?",
          "",
          sign,
        ].join("\n"),
      };
  }
}

/** Lien mailto (longueur limitée — OK pour des relances courtes). */
export function buildMailtoHref(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${to}?${params.toString()}`;
}
