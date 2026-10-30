import { LogMailer } from "@/server/infrastructure/mail/log-mailer";
import { ManualPaymentGateway } from "@/server/infrastructure/payment/manual-payment-gateway";
import {
  auditLogRepository,
  catalogOfferRepository,
  clientRepository,
  invoiceRepository,
  paymentRepository,
  quoteRepository,
  subscriptionRepository,
  userRepository,
} from "@/server/infrastructure/prisma/repositories";

/** Composition root MVP. SMTP/Resend se brancheront via IMailer. */
export const deps = {
  clients: clientRepository,
  quotes: quoteRepository,
  invoices: invoiceRepository,
  subscriptions: subscriptionRepository,
  payments: paymentRepository,
  catalog: catalogOfferRepository,
  audit: auditLogRepository,
  users: userRepository,
  paymentGateway: new ManualPaymentGateway(),
  mailer: new LogMailer(),
};

export type AppDeps = typeof deps;
