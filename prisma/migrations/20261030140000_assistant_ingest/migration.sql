-- CreateEnum
CREATE TYPE "AssistantBatchKind" AS ENUM ('veille', 'prospection');

-- CreateEnum
CREATE TYPE "AssistantItemStatus" AS ENUM ('new', 'used', 'dismissed');

-- CreateTable
CREATE TABLE "AssistantBatch" (
    "id" TEXT NOT NULL,
    "kind" "AssistantBatchKind" NOT NULL,
    "title" TEXT,
    "periodLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantItem" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "detail" TEXT,
    "sourceUrl" TEXT,
    "commercialAction" TEXT,
    "draftEmailSubject" TEXT,
    "draftEmailBody" TEXT,
    "externalKey" TEXT,
    "status" "AssistantItemStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantBatch_kind_createdAt_idx" ON "AssistantBatch"("kind", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssistantItem_externalKey_key" ON "AssistantItem"("externalKey");

-- CreateIndex
CREATE INDEX "AssistantItem_batchId_idx" ON "AssistantItem"("batchId");

-- CreateIndex
CREATE INDEX "AssistantItem_status_idx" ON "AssistantItem"("status");

-- AddForeignKey
ALTER TABLE "AssistantItem" ADD CONSTRAINT "AssistantItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AssistantBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
