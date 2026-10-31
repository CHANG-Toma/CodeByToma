import type {
  AssistantBatchKind,
  AssistantBatchRecord,
  AssistantItemRecord,
  AssistantItemStatus,
} from "../assistant";
import type {
  BotTaskRecord,
  BotTaskResponsible,
  BotTaskStatus,
} from "../tasks";
import type { OfferKind } from "../catalog";
import type { UserRole } from "../roles";
import type {
  InvoiceStatus,
  QuoteStatus,
  SubscriptionStatus,
} from "../status-transitions";

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
  quoteId: string;
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

export type SubscriptionRecord = {
  id: string;
  clientId: string;
  offerKind: OfferKind;
  label: string;
  priceCents: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  nextBillingDate: Date | null;
  commitmentMonths: number;
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
  quoteId: string;
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
  sumInvoicedInPeriod(from: Date, to: Date): Promise<number>;
  countByStatus(status: InvoiceStatus): Promise<number>;
};

export type IPaymentRepository = {
  findById(id: string): Promise<PaymentRecord | null>;
  list(filters?: {
    invoiceId?: string;
    clientId?: string;
  }): Promise<PaymentRecord[]>;
  create(
    data: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<PaymentRecord>;
  sumByInvoice(invoiceId: string): Promise<number>;
};

export type ISubscriptionRepository = {
  findById(id: string): Promise<SubscriptionRecord | null>;
  list(filters?: {
    clientId?: string;
    status?: SubscriptionStatus;
  }): Promise<SubscriptionRecord[]>;
  create(
    data: Omit<SubscriptionRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<SubscriptionRecord>;
  update(
    id: string,
    data: Partial<
      Omit<SubscriptionRecord, "id" | "createdAt" | "updatedAt" | "clientId">
    >,
  ): Promise<SubscriptionRecord>;
  countActive(): Promise<number>;
};

export type ICatalogOfferRepository = {
  listActive(): Promise<CatalogOfferRecord[]>;
  findByKind(kind: OfferKind): Promise<CatalogOfferRecord | null>;
  updatePrice(
    kind: OfferKind,
    priceCents: number,
    description?: string | null,
  ): Promise<CatalogOfferRecord>;
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

export type AssistantItemCreateInput = {
  title: string;
  summary?: string | null;
  detail?: string | null;
  sourceUrl?: string | null;
  commercialAction?: string | null;
  draftEmailSubject?: string | null;
  draftEmailBody?: string | null;
  externalKey?: string | null;
};

export type IAssistantRepository = {
  createBatch(input: {
    kind: AssistantBatchKind;
    title?: string | null;
    periodLabel?: string | null;
    items: AssistantItemCreateInput[];
  }): Promise<AssistantBatchRecord>;
  listBatches(filters?: {
    kind?: AssistantBatchKind;
    limit?: number;
  }): Promise<AssistantBatchRecord[]>;
  listProspectKeys(): Promise<string[]>;
  updateItemStatus(
    id: string,
    status: AssistantItemStatus,
  ): Promise<AssistantItemRecord>;
};

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  role: UserRole;
  clientId: string | null;
};

export type IAdminPreferenceRepository = {
  get(): Promise<{ monthlyRevenueGoalCents: number | null }>;
  setMonthlyRevenueGoalCents(cents: number | null): Promise<void>;
};

export type BotTaskCreateInput = {
  externalId?: string | null;
  title: string;
  detail?: string | null;
  responsible: BotTaskResponsible;
  status?: BotTaskStatus;
  dueAt?: Date | null;
  clientId?: string | null;
};

export type IBotTaskRepository = {
  findById(id: string): Promise<BotTaskRecord | null>;
  findByExternalId(externalId: string): Promise<BotTaskRecord | null>;
  list(filters?: {
    status?: BotTaskStatus;
    responsible?: BotTaskResponsible;
  }): Promise<BotTaskRecord[]>;
  create(data: BotTaskCreateInput): Promise<BotTaskRecord>;
  update(
    id: string,
    data: Partial<
      Omit<BotTaskCreateInput, "externalId"> & { externalId?: string | null }
    >,
  ): Promise<BotTaskRecord>;
  upsertByExternalId(
    externalId: string,
    create: BotTaskCreateInput,
    update: Partial<Omit<BotTaskCreateInput, "externalId">>,
  ): Promise<BotTaskRecord>;
};

export type IUserRepository = {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(
    id: string,
  ): Promise<Omit<AuthUserRecord, "passwordHash"> | null>;
  findByClientId(
    clientId: string,
  ): Promise<Omit<AuthUserRecord, "passwordHash"> | null>;
  updateProfile(
    id: string,
    data: { name: string | null },
  ): Promise<Omit<AuthUserRecord, "passwordHash">>;
  createClientAccess(data: {
    email: string;
    passwordHash: string;
    name: string | null;
    clientId: string;
  }): Promise<Omit<AuthUserRecord, "passwordHash">>;
};
