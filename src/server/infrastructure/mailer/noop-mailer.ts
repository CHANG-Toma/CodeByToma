import type { IMailer, MailMessage } from "@/server/domain/ports/mailer";

/** Phase 4 : brancher un vrai transporteur. */
export class NoOpMailer implements IMailer {
  async send(message: MailMessage): Promise<void> {
    void message;
    // Intentionnellement vide — pas d'envoi email au MVP.
  }
}
