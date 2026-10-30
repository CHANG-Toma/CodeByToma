import { listAssistantBatches } from "@/server/application/assistant";
import { listTodayActions } from "@/server/application/today-actions";
import type { AssistantBatchKind } from "@/server/domain/assistant";

export type NoriSummary = {
  veilleItems: number;
  prospectItems: number;
  todayActions: number;
  latestGeneration: string | null;
};

function latestNewItems(
  batches: Awaited<ReturnType<typeof listAssistantBatches>>,
  kind: AssistantBatchKind,
): number {
  const latest = batches.find((batch) => batch.kind === kind);
  return latest?.items.filter((item) => item.status === "new").length ?? 0;
}

export async function getNoriSummary(): Promise<NoriSummary> {
  const [batches, todayActions] = await Promise.all([
    listAssistantBatches(),
    listTodayActions(),
  ]);
  const latestBatch = batches.reduce<(typeof batches)[number] | null>(
    (latest, batch) =>
      !latest || batch.createdAt > latest.createdAt ? batch : latest,
    null,
  );

  return {
    veilleItems: latestNewItems(batches, "veille"),
    prospectItems: latestNewItems(batches, "prospection"),
    todayActions: todayActions.length,
    latestGeneration: latestBatch?.createdAt.toISOString() ?? null,
  };
}
