-- CreateEnum
CREATE TYPE "BotTaskResponsible" AS ENUM ('ceo_finance', 'commercial_tech', 'marketing', 'toma');

-- CreateEnum
CREATE TYPE "BotTaskStatus" AS ENUM ('todo', 'in_progress', 'to_validate', 'done', 'blocked');

-- CreateTable
CREATE TABLE "AdminPreference" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "monthlyRevenueGoalCents" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotTask" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "responsible" "BotTaskResponsible" NOT NULL,
    "status" "BotTaskStatus" NOT NULL DEFAULT 'todo',
    "dueAt" TIMESTAMP(3),
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotTask_externalId_key" ON "BotTask"("externalId");

-- CreateIndex
CREATE INDEX "BotTask_status_idx" ON "BotTask"("status");

-- CreateIndex
CREATE INDEX "BotTask_responsible_idx" ON "BotTask"("responsible");

-- CreateIndex
CREATE INDEX "BotTask_dueAt_idx" ON "BotTask"("dueAt");

-- AddForeignKey
ALTER TABLE "BotTask" ADD CONSTRAINT "BotTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
