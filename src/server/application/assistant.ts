import { timingSafeEqual } from "node:crypto";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/server/domain/errors";
import type {
  AssistantBatchKind,
  AssistantBatchRecord,
  AssistantItemStatus,
} from "@/server/domain/assistant";
import { deps } from "./container";
import { assistantIngestSchema } from "./schemas";

function getIngestSecret(): string | null {
  const secret = process.env.ASSISTANT_INGEST_SECRET?.trim();
  if (!secret || secret.length < 24) return null;
  return secret;
}

export function assertAssistantIngestAuthorized(
  authorizationHeader: string | null,
): void {
  const expected = getIngestSecret();
  if (!expected) {
    throw new UnauthorizedError("Ingest non configuré");
  }
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Non autorisé");
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new UnauthorizedError("Non autorisé");
  }
}

export async function ingestAssistantBatch(
  input: unknown,
): Promise<{ batchId: string; itemCount: number; skippedKeys: number }> {
  const parsed = assistantIngestSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Payload invalide",
    );
  }

  if (parsed.data.kind === "prospection") {
    const missingKey = parsed.data.items.some((i) => !i.externalKey);
    if (missingKey) {
      throw new ValidationError(
        "Chaque prospect doit avoir un externalKey pour la déduplication",
      );
    }
  }

  const beforeKeys =
    parsed.data.kind === "prospection"
      ? new Set(await deps.assistant.listProspectKeys())
      : null;

  const batch = await deps.assistant.createBatch({
    kind: parsed.data.kind,
    title: parsed.data.title,
    periodLabel: parsed.data.periodLabel,
    items: parsed.data.items,
  });

  const skipped =
    beforeKeys && parsed.data.kind === "prospection"
      ? parsed.data.items.filter(
          (i) => i.externalKey && beforeKeys.has(i.externalKey),
        ).length
      : 0;

  await deps.audit.append({
    action: "assistant.ingested",
    entity: "AssistantBatch",
    entityId: batch.id,
    metadata: {
      kind: batch.kind,
      itemCount: batch.items.length,
      skipped,
    },
  });

  return {
    batchId: batch.id,
    itemCount: batch.items.length,
    skippedKeys: skipped,
  };
}

export async function listAssistantBatches(filters?: {
  kind?: AssistantBatchKind;
}): Promise<AssistantBatchRecord[]> {
  return deps.assistant.listBatches({ ...filters, limit: 30 });
}

export async function listKnownProspectKeys(): Promise<string[]> {
  return deps.assistant.listProspectKeys();
}

export async function setAssistantItemStatus(
  id: string,
  status: AssistantItemStatus,
): Promise<void> {
  try {
    await deps.assistant.updateItemStatus(id, status);
  } catch {
    throw new NotFoundError("Élément assistant", id);
  }
}
