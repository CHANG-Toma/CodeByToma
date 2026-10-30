/**
 * End-to-end proof that Prisma talks to Neon (pooled URL).
 * Prints counts only — no PII / secrets.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const batch = await prisma.assistantBatch.create({
    data: {
      kind: "veille",
      title: "Neon e2e",
      periodLabel: "proof",
      items: {
        create: [{ title: "Wire ok", summary: "via Prisma pooled" }],
      },
    },
  });

  const [users, clients, batches, offers] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.assistantBatch.count(),
    prisma.catalogOffer.count(),
  ]);

  console.log(
    JSON.stringify({
      ok: true,
      neon: true,
      wroteBatchPrefix: `${batch.id.slice(0, 8)}…`,
      counts: {
        users,
        clients,
        assistantBatches: batches,
        catalogOffers: offers,
      },
    }),
  );
} finally {
  await prisma.$disconnect();
}
