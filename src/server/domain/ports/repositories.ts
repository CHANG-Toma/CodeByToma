import type { OfferKind } from "../catalog";
import type { UserRole } from "../roles";
import type { InvoiceStatus, QuoteStatus } from "../status-transitions";

export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  billingAddress: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  billingCountry: string;
  notes: string | null;
  consentMarketing: boolean;
  consentContract: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LineRecord = {
  id: string;
  label: string;
  description: string | null;
  quantity: number;
  unitPriceHtCents: number;
  taxRatePercent: number;
  position: number;
};

export type QuoteRecord = {
  id: string;
  number: string;
  clientId: string;
  status: QuoteStatus;
  currency: string;
  validUntil: Date | null;
  notes: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  acceptedAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lines: LineRecord[];
};

export type InvoiceRecord = {
  id: string;
  number: string;
  sequentialNumber: number;
  clientId: string;
  quoteId: string | null;
  status: InvoiceStatus;
  currency: string;
  issuedAt: Date | null;
  dueAt: Date | null;
  notes: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  createdAt: Date;
  updatedAt: Date;
  lines: LineRecord[];
};

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  amountCents: number;
  currency: string;
  method: string;
  status: string;
  paidAt: Date;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CatalogOfferRecord = {
  id: string;
  kind: OfferKind;
  label: string;
  description: string | null;
  priceCents: number;
  currency: string;
  isActive: boolean;
};

export type ClientFilters = {
  search?: string;
  includeDeleted?: boolean;
};

export type IClientRepository = {
  findById(id: string): Promise<ClientRecord | null>;
  list(filters?: ClientFilters): Promise<ClientRecord[]>;
  create(
    data: Omit<ClientRecord, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<ClientRecord>;
  update(
    id: string,
    data: Partial<
      Omit<ClientRecord, "id" | "createdAt" | "updatedAt" | "deletedAt">
    >,
  ): Promise<ClientRecord>;
  softDelete(id: string): Promise<void>;
};

export type QuoteCreateInput = {
  clientId: string;
  number: string;
  validUntil?: Date | null;
  notes?: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lines: Array<Omit<LineRecord, "id">>;
};

export type IQuoteRepository = {
  findById(id: string): Promise<QuoteRecord | null>;
  list(filters?: {
    clientId?: string;
    status?: QuoteStatus;
    search?: string;
  }): Promise<QuoteRecord[]>;
  create(data: QuoteCreateInput): Promise<QuoteRecord>;
  update(
    id: string,
    data: Partial<{
      status: QuoteStatus;
      validUntil: Date | null;
      notes: string | null;
      subtotalCents: number;
      taxCents: number;
      totalCents: number;
      acceptedAt: Date | null;
      sentAt: Date | null;
      lines: Array<Omit<LineRecord, "id">>;
    }>,
  ): Promise<QuoteRecord>;
  countByYear(year: number): Promise<number>;
};

export type InvoiceCreateInput = {
  clientId: string;
  quoteId?: string | null;
  number: string;
  sequentialNumber: number;
  status: InvoiceStatus;
  issuedAt?: Date | null;
  dueAt?: Date | null;
  notes?: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lines: Array<Omit<LineRecord, "id">>;
};

export type IInvoiceRepository = {
  findById(id: string): Promise<InvoiceRecord | null>;
  list(filters?: {
    clientId?: string;
    status?: InvoiceStatus;
    search?: string;
  }): Promise<InvoiceRecord[]>;
  create(data: InvoiceCreateInput): Promise<InvoiceRecord>;
  update(
    id: string,
    data: Partial<{
      status: InvoiceStatus;
      issuedAt: Date | null;
      dueAt: Date | null;
      notes: string | null;
      paidCents: number;
      subtotalCents: number;
      taxCents: number;
      totalCents: number;
      lines: Array<Omit<LineRecord, "id">>;
    }>,
  ): Promise<InvoiceRecord>;
  nextSequential(year: number): Promise<{ sequential: number; number: string }>;
  sumPaidInPeriod(from: Date, to: Date): Promise<number>;
  countByStatus(status: InvoiceStatus): Promise<number>;
};

export type IPaymentRepository = {
  findById(id: string): Promise<PaymentRecord | null>;
  list(filters?: { invoiceId?: string }): Promise<PaymentRecord[]>;
  create(
    data: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<PaymentRecord>;
  sumByInvoice(invoiceId: string): Promise<number>;
};

export type ICatalogOfferRepository = {
  listActive(): Promise<CatalogOfferRecord[]>;
  findByKind(kind: OfferKind): Promise<CatalogOfferRecord | null>;
};

export type IAuditLogRepository = {
  append(entry: {
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<void>;
};

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: UserRole;
  clientId: string | null;
};

export type IUserRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(
    id: string,
  ): Promise<Omit<AuthUserRecord, "passwordHash"> | null>;
  findByClientId(
    clientId: string,
  ): Promise<Omit<AuthUserRecord, "passwordHash"> | null>;
  createClientAccess(data: {
    email: string;
    passwordHash: string;
    name: string | null;
    clientId: string;
  }): Promise<Omit<AuthUserRecord, "passwordHash">>;
};
