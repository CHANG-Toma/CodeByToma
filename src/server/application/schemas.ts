import { z } from "zod";
import { OFFER_KINDS } from "@/server/domain/catalog";
import {
  INVOICE_STATUSES,
  QUOTE_STATUSES,
  SUBSCRIPTION_STATUSES,
} from "@/server/domain/status-transitions";

export const lineInputSchema = z.object({
  label: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  quantity: z.number().positive(),
  unitPriceHtCents: z.number().int().nonnegative(),
  taxRatePercent: z.number().min(0).max(100).default(0),
  position: z.number().int().nonnegative().optional(),
});

export const clientCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(40).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  billingAddress: z.string().max(500).optional().nullable(),
  billingCity: z.string().max(120).optional().nullable(),
  billingPostalCode: z.string().max(20).optional().nullable(),
  billingCountry: z.string().length(2).default("FR"),
  notes: z.string().max(5000).optional().nullable(),
  consentMarketing: z.boolean().default(false),
  consentContract: z.boolean().default(true),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export const quoteCreateSchema = z.object({
  clientId: z.string().min(1),
  validUntil: z.coerce.date().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  lines: z.array(lineInputSchema).min(1),
});

export const quoteStatusSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
});

export const invoiceCreateSchema = z.object({
  clientId: z.string().min(1),
  quoteId: z.string().optional().nullable(),
  dueAt: z.coerce.date().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  lines: z.array(lineInputSchema).min(1),
  issueNow: z.boolean().default(true),
});

export const invoiceStatusSchema = z.object({
  status: z.enum(INVOICE_STATUSES),
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().min(1),
  amountCents: z.number().int().positive(),
  method: z
    .enum(["bank_transfer", "card", "cash", "check", "other"])
    .default("bank_transfer"),
  paidAt: z.coerce.date().default(() => new Date()),
  reference: z.string().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const subscriptionCreateSchema = z.object({
  clientId: z.string().min(1),
  offerKind: z.enum(OFFER_KINDS),
  label: z.string().min(1).max(200).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  nextBillingDate: z.coerce.date().optional().nullable(),
  commitmentMonths: z.number().int().positive().default(12),
  notes: z.string().max(5000).optional().nullable(),
});

export const subscriptionStatusSchema = z.object({
  status: z.enum(SUBSCRIPTION_STATUSES),
});

export const signInSchema = z.object({
  email: z.string().email().max(320),
  /** Connexion : borne large ; la politique stricte s'applique à la création / reset. */
  password: z.string().min(1).max(128),
});

export const clientAccessCreateSchema = z.object({
  clientId: z.string().min(1),
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
  name: z.string().min(1).max(200).optional().nullable(),
});

/** Champs que le client peut modifier lui-même (pas les notes internes). */
export const portalProfileUpdateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(40).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  billingAddress: z.string().max(500).optional().nullable(),
  billingCity: z.string().max(120).optional().nullable(),
  billingPostalCode: z.string().max(20).optional().nullable(),
  billingCountry: z.string().length(2).default("FR"),
  consentMarketing: z.boolean().default(false),
  consentContract: z.boolean().default(true),
});
