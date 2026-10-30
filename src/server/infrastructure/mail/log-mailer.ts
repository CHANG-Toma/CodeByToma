import type { IMailer, MailMessage } from "@/server/domain/ports/mailer";

/**
 * Mailer MVP : log serveur (pas d’envoi SMTP).
 * Brancher Resend/SMTP plus tard via le port IMailer.
 */
export class LogMailer implements IMailer {
  async send(message: MailMessage): Promise<void> {
    // Pas de PII complète en prod logs si possible — on limite au domaine
    const domain = message.to.includes("@")
      ? message.to.slice(message.to.indexOf("@"))
      : "[invalid]";
    console.info(
      `[mailer:log] to=*${domain} subject=${JSON.stringify(message.subject)}`,
    );
  }
}
