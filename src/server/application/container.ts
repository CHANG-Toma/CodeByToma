import { ManualPaymentGateway } from "@/server/infrastructure/payment/manual-payment-gateway";
import { NoOpMailer } from "@/server/infrastructure/mailer/noop-mailer";
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
  mailer: new NoOpMailer(),
};

export type AppDeps = typeof deps;
