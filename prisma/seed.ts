import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG_OFFERS } from "../src/server/domain/catalog";
import { validatePasswordPolicy } from "../src/server/domain/password-policy";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.AUTH_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.AUTH_ADMIN_PASSWORD ?? "ChangeMe-Strong1";

  const policy = validatePasswordPolicy(password);
  if (!policy.ok) {
    throw new Error(`AUTH_ADMIN_PASSWORD non conforme : ${policy.message}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "Admin CodeByToma", role: "admin" },
    create: {
      email,
      passwordHash,
      name: "Admin CodeByToma",
      role: "admin",
    },
  });

  for (const offer of CATALOG_OFFERS) {
    await prisma.catalogOffer.upsert({
      where: { kind: offer.kind },
      update: {
        label: offer.label,
        description: offer.description,
        priceCents: offer.priceCents,
        isActive: true,
      },
      create: {
        kind: offer.kind,
        label: offer.label,
        description: offer.description,
        priceCents: offer.priceCents,
        isActive: true,
      },
    });
  }

  // Anciennes formules éventuelles encore en base
  await prisma.catalogOffer.deleteMany({
    where: { kind: { notIn: ["setup", "hosting", "custom"] } },
  }).catch(() => undefined);

  // Clients fictifs uniquement — pas de vraies PII
  const clientA = await prisma.client.upsert({
    where: { id: "seed_client_atelier" },
    update: {},
    create: {
      id: "seed_client_atelier",
      name: "Alice Martin",
      email: "alice.martin@exemple-demo.fr",
      phone: "06 00 00 00 01",
      companyName: "Atelier Demo",
      billingAddress: "12 rue des Lilas",
      billingCity: "Lyon",
      billingPostalCode: "69001",
      billingCountry: "FR",
      notes: "Client de démonstration — seed",
      consentContract: true,
      consentMarketing: false,
    },
  });

  const clientB = await prisma.client.upsert({
    where: { id: "seed_client_bistro" },
    update: {},
    create: {
      id: "seed_client_bistro",
      name: "Bruno Dupont",
      email: "bruno.dupont@exemple-demo.fr",
      companyName: "Bistro Démo",
      billingCity: "Nantes",
      billingPostalCode: "44000",
      billingCountry: "FR",
      consentContract: true,
    },
  });

  const existingQuote = await prisma.quote.findUnique({
    where: { number: "DEV-2026-0001" },
  });

  if (!existingQuote) {
    const quote = await prisma.quote.create({
      data: {
        number: "DEV-2026-0001",
        clientId: clientA.id,
        status: "sent",
        sentAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotalCents: 17900,
        taxCents: 0,
        totalCents: 17900,
        notes: "Création + 1er mois d'hébergement",
        lines: {
          create: [
            {
              label: "Création du site",
              quantity: 1,
              unitPriceHtCents: 14900,
              taxRatePercent: 0,
              position: 0,
            },
            {
              label: "Hébergement — 1er mois",
              quantity: 1,
              unitPriceHtCents: 3000,
              taxRatePercent: 0,
              position: 1,
            },
          ],
        },
      },
    });

    console.log("Seed quote:", quote.number);
  }

  const existingSub = await prisma.subscription.findFirst({
    where: { clientId: clientA.id, offerKind: "hosting", status: "active" },
  });
  if (!existingSub) {
    const startDate = new Date();
    await prisma.subscription.create({
      data: {
        clientId: clientA.id,
        offerKind: "hosting",
        label: "Hébergement mensuel",
        priceCents: 3000,
        status: "active",
        startDate,
        endDate: new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 12,
          startDate.getDate(),
        ),
        nextBillingDate: new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
        ),
        commitmentMonths: 12,
      },
    });
  }

  await prisma.invoiceSequence.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", year: new Date().getFullYear(), counter: 0 },
  });

  const clientPassword =
    process.env.AUTH_CLIENT_PASSWORD ?? "ClientDemo-Strong1";
  const clientPolicy = validatePasswordPolicy(clientPassword);
  if (!clientPolicy.ok) {
    throw new Error(`AUTH_CLIENT_PASSWORD non conforme : ${clientPolicy.message}`);
  }
  const clientPasswordHash = await bcrypt.hash(clientPassword, 12);
  const clientEmail = "alice.martin@exemple-demo.fr";

  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {
      passwordHash: clientPasswordHash,
      name: "Alice Martin",
      role: "client",
      clientId: clientA.id,
    },
    create: {
      email: clientEmail,
      passwordHash: clientPasswordHash,
      name: "Alice Martin",
      role: "client",
      clientId: clientA.id,
    },
  });

  console.log("Seed OK — admin:", user.email);
  console.log("Clients démo:", clientA.email, clientB.email);
  console.log("Espace client démo:", clientEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
