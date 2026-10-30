-- Orphan invoices without a quote cannot remain once quoteId is required.
DELETE FROM "Payment" WHERE "invoiceId" IN (
  SELECT "id" FROM "Invoice" WHERE "quoteId" IS NULL
);
DELETE FROM "InvoiceLine" WHERE "invoiceId" IN (
  SELECT "id" FROM "Invoice" WHERE "quoteId" IS NULL
);
DELETE FROM "Invoice" WHERE "quoteId" IS NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "quoteId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_quoteId_fkey";

-- AddForeignKey (no longer SET NULL on delete)
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
