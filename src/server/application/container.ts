import { ManualPaymentGateway } from "@/server/infrastructure/payment/manual-payment-gateway";
import {
  auditLogRepository,
  catalogOfferRepository,
  clientRepository,
  invoiceRepository,
  paymentRepository,
  quoteRepository,
  userRepository,
} from "@/server/infrastructure/prisma/repositories";

/** Composition root MVP. IMailer / Stripe se brancheront ici plus tard. */
export const deps = {
  clients: clientRepository,
  quotes: quoteRepository,
  invoices: invoiceRepository,
  payments: paymentRepository,
  catalog: catalogOfferRepository,
  audit: auditLogRepository,
  users: userRepository,
  paymentGateway: new ManualPaymentGateway(),
};

export type AppDeps = typeof deps;
