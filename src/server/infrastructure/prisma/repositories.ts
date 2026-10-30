import type {
  InvoiceStatus as PrismaInvoiceStatus,
  OfferKind as PrismaOfferKind,
  PaymentMethod,
  PaymentStatus,
  QuoteStatus as PrismaQuoteStatus,
  SubscriptionStatus as PrismaSubscriptionStatus,
} from "@prisma/client";
import { formatInvoiceNumber } from "@/server/domain/invoice-numbering";
import type { OfferKind } from "@/server/domain/catalog";
import type {
  ClientFilters,
  IAuditLogRepository,
  ICatalogOfferRepository,
  IClientRepository,
  IInvoiceRepository,
  InvoiceCreateInput,
  IPaymentRepository,
  IQuoteRepository,
  ISubscriptionRepository,
  IUserRepository,
  QuoteCreateInput,
} from "@/server/domain/ports/repositories";
import { prisma } from "./client";
import {
  mapCatalogOffer,
  mapClient,
  mapInvoice,
  mapPayment,
  mapQuote,
  mapSubscription,
} from "./mappers";

export const clientRepository: IClientRepository = {
  async findById(id) {
    const row = await prisma.client.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? mapClient(row) : null;
  },

  async list(filters?: ClientFilters) {
    const search = filters?.search?.trim();
    const rows = await prisma.client.findMany({
      where: {
        deletedAt: filters?.includeDeleted ? undefined : null,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
    });
    return rows.map(mapClient);
  },

  async create(data) {
    const row = await prisma.client.create({ data });
    return mapClient(row);
  },

  async update(id, data) {
    const row = await prisma.client.update({ where: { id }, data });
    return mapClient(row);
  },

  async softDelete(id) {
    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};

export const quoteRepository: IQuoteRepository = {
  async findById(id) {
    const row = await prisma.quote.findUnique({
      where: { id },
      include: { lines: true },
    });
    return row ? mapQuote(row) : null;
  },

  async list(filters) {
    const search = filters?.search?.trim();
    const rows = await prisma.quote.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.status
          ? { status: filters.status as PrismaQuoteStatus }
          : {}),
        ...(search
          ? {
              OR: [
                { number: { contains: search, mode: "insensitive" } },
                { client: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapQuote);
  },

  async create(data: QuoteCreateInput) {
    const row = await prisma.quote.create({
      data: {
        clientId: data.clientId,
        number: data.number,
        validUntil: data.validUntil ?? null,
        notes: data.notes ?? null,
        subtotalCents: data.subtotalCents,
        taxCents: data.taxCents,
        totalCents: data.totalCents,
        lines: {
          create: data.lines.map((l) => ({
            label: l.label,
            description: l.description,
            quantity: l.quantity,
            unitPriceHtCents: l.unitPriceHtCents,
            taxRatePercent: l.taxRatePercent,
            position: l.position,
          })),
        },
      },
      include: { lines: true },
    });
    return mapQuote(row);
  },

  async update(id, data) {
    const row = await prisma.$transaction(async (tx) => {
      if (data.lines) {
        await tx.quoteLine.deleteMany({ where: { quoteId: id } });
        await tx.quoteLine.createMany({
          data: data.lines.map((l) => ({
            quoteId: id,
            label: l.label,
            description: l.description,
            quantity: l.quantity,
            unitPriceHtCents: l.unitPriceHtCents,
            taxRatePercent: l.taxRatePercent,
            position: l.position,
          })),
        });
      }
      return tx.quote.update({
        where: { id },
        data: {
          ...(data.status !== undefined
            ? { status: data.status as PrismaQuoteStatus }
            : {}),
          ...(data.validUntil !== undefined
            ? { validUntil: data.validUntil }
            : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.subtotalCents !== undefined
            ? { subtotalCents: data.subtotalCents }
            : {}),
          ...(data.taxCents !== undefined ? { taxCents: data.taxCents } : {}),
          ...(data.totalCents !== undefined
            ? { totalCents: data.totalCents }
            : {}),
          ...(data.acceptedAt !== undefined
            ? { acceptedAt: data.acceptedAt }
            : {}),
          ...(data.sentAt !== undefined ? { sentAt: data.sentAt } : {}),
        },
        include: { lines: true },
      });
    });
    return mapQuote(row);
  },

  async countByYear(year) {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    return prisma.quote.count({
      where: { createdAt: { gte: start, lt: end } },
    });
  },
};

export const invoiceRepository: IInvoiceRepository = {
  async findById(id) {
    const row = await prisma.invoice.findUnique({
      where: { id },
      include: { lines: true },
    });
    return row ? mapInvoice(row) : null;
  },

  async list(filters) {
    const search = filters?.search?.trim();
    const rows = await prisma.invoice.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.status
          ? { status: filters.status as PrismaInvoiceStatus }
          : {}),
        ...(search
          ? {
              OR: [
                { number: { contains: search, mode: "insensitive" } },
                { client: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapInvoice);
  },

  async create(data: InvoiceCreateInput) {
    const row = await prisma.invoice.create({
      data: {
        clientId: data.clientId,
        quoteId: data.quoteId,
        number: data.number,
        sequentialNumber: data.sequentialNumber,
        status: data.status as PrismaInvoiceStatus,
        issuedAt: data.issuedAt ?? null,
        dueAt: data.dueAt ?? null,
        notes: data.notes ?? null,
        subtotalCents: data.subtotalCents,
        taxCents: data.taxCents,
        totalCents: data.totalCents,
        lines: {
          create: data.lines.map((l) => ({
            label: l.label,
            description: l.description,
            quantity: l.quantity,
            unitPriceHtCents: l.unitPriceHtCents,
            taxRatePercent: l.taxRatePercent,
            position: l.position,
          })),
        },
      },
      include: { lines: true },
    });
    return mapInvoice(row);
  },

  async update(id, data) {
    const row = await prisma.$transaction(async (tx) => {
      if (data.lines) {
        await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceLine.createMany({
          data: data.lines.map((l) => ({
            invoiceId: id,
            label: l.label,
            description: l.description,
            quantity: l.quantity,
            unitPriceHtCents: l.unitPriceHtCents,
            taxRatePercent: l.taxRatePercent,
            position: l.position,
          })),
        });
      }
      return tx.invoice.update({
        where: { id },
        data: {
          ...(data.status !== undefined
            ? { status: data.status as PrismaInvoiceStatus }
            : {}),
          ...(data.issuedAt !== undefined ? { issuedAt: data.issuedAt } : {}),
          ...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.paidCents !== undefined
            ? { paidCents: data.paidCents }
            : {}),
          ...(data.subtotalCents !== undefined
            ? { subtotalCents: data.subtotalCents }
            : {}),
          ...(data.taxCents !== undefined ? { taxCents: data.taxCents } : {}),
          ...(data.totalCents !== undefined
            ? { totalCents: data.totalCents }
            : {}),
        },
        include: { lines: true },
      });
    });
    return mapInvoice(row);
  },

  async nextSequential(year) {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.invoiceSequence.findUnique({
        where: { id: "default" },
      });

      let counter: number;
      if (!existing) {
        await tx.invoiceSequence.create({
          data: { id: "default", year, counter: 1 },
        });
        counter = 1;
      } else if (existing.year !== year) {
        await tx.invoiceSequence.update({
          where: { id: "default" },
          data: { year, counter: 1 },
        });
        counter = 1;
      } else {
        const updated = await tx.invoiceSequence.update({
          where: { id: "default" },
          data: { counter: { increment: 1 } },
        });
        counter = updated.counter;
      }

      return {
        sequential: counter,
        number: formatInvoiceNumber(year, counter),
      };
    });
    return result;
  },

  async sumPaidInPeriod(from, to) {
    const agg = await prisma.payment.aggregate({
      where: {
        status: "completed",
        paidAt: { gte: from, lt: to },
      },
      _sum: { amountCents: true },
    });
    return agg._sum.amountCents ?? 0;
  },

  async countByStatus(status) {
    return prisma.invoice.count({
      where: { status: status as PrismaInvoiceStatus },
    });
  },
};

export const paymentRepository: IPaymentRepository = {
  async findById(id) {
    const row = await prisma.payment.findUnique({ where: { id } });
    return row ? mapPayment(row) : null;
  },

  async list(filters) {
    const rows = await prisma.payment.findMany({
      where: {
        ...(filters?.invoiceId ? { invoiceId: filters.invoiceId } : {}),
        ...(filters?.clientId
          ? { invoice: { clientId: filters.clientId } }
          : {}),
      },
      orderBy: { paidAt: "desc" },
    });
    return rows.map(mapPayment);
  },

  async create(data) {
    const row = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amountCents: data.amountCents,
        currency: data.currency,
        method: data.method as PaymentMethod,
        status: data.status as PaymentStatus,
        paidAt: data.paidAt,
        reference: data.reference,
        notes: data.notes,
      },
    });
    return mapPayment(row);
  },

  async sumByInvoice(invoiceId) {
    const agg = await prisma.payment.aggregate({
      where: { invoiceId, status: "completed" },
      _sum: { amountCents: true },
    });
    return agg._sum.amountCents ?? 0;
  },
};

export const subscriptionRepository: ISubscriptionRepository = {
  async findById(id) {
    const row = await prisma.subscription.findUnique({ where: { id } });
    return row ? mapSubscription(row) : null;
  },

  async list(filters) {
    const rows = await prisma.subscription.findMany({
      where: {
        ...(filters?.clientId ? { clientId: filters.clientId } : {}),
        ...(filters?.status
          ? { status: filters.status as PrismaSubscriptionStatus }
          : {}),
      },
      orderBy: { nextBillingDate: "asc" },
    });
    return rows.map(mapSubscription);
  },

  async create(data) {
    const row = await prisma.subscription.create({
      data: {
        ...data,
        offerKind: data.offerKind as PrismaOfferKind,
        status: data.status as PrismaSubscriptionStatus,
      },
    });
    return mapSubscription(row);
  },

  async update(id, data) {
    const row = await prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        ...(data.offerKind
          ? { offerKind: data.offerKind as PrismaOfferKind }
          : {}),
        ...(data.status
          ? { status: data.status as PrismaSubscriptionStatus }
          : {}),
      },
    });
    return mapSubscription(row);
  },

  async countActive() {
    return prisma.subscription.count({ where: { status: "active" } });
  },
};

export const catalogOfferRepository: ICatalogOfferRepository = {
  async listActive() {
    const rows = await prisma.catalogOffer.findMany({
      where: { isActive: true },
      orderBy: { priceCents: "asc" },
    });
    return rows.map(mapCatalogOffer);
  },

  async findByKind(kind: OfferKind) {
    const row = await prisma.catalogOffer.findUnique({
      where: { kind: kind as PrismaOfferKind },
    });
    return row ? mapCatalogOffer(row) : null;
  },

  async updatePrice(kind, priceCents, description) {
    const row = await prisma.catalogOffer.update({
      where: { kind: kind as PrismaOfferKind },
      data: {
        priceCents,
        ...(description !== undefined ? { description } : {}),
      },
    });
    return mapCatalogOffer(row);
  },
};

export const auditLogRepository: IAuditLogRepository = {
  async append(entry) {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata
          ? (entry.metadata as Record<string, string | number | boolean | null>)
          : undefined,
      },
    });
  },
};

export const userRepository: IUserRepository = {
  async findByEmail(email) {
    const row = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        clientId: true,
      },
    });
    return row;
  },

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clientId: true,
      },
    });
  },

  async findByClientId(clientId) {
    return prisma.user.findUnique({
      where: { clientId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clientId: true,
      },
    });
  },

  async updateProfile(id, data) {
    return prisma.user.update({
      where: { id },
      data: { name: data.name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clientId: true,
      },
    });
  },

  async createClientAccess(data) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: "client",
        clientId: data.clientId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clientId: true,
      },
    });
  },
};
