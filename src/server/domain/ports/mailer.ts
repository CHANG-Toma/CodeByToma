/**
 * Point d'extension Phase 4 — pas d'envoi réel au MVP.
 */
export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface IMailer {
  send(message: MailMessage): Promise<void>;
}
