export const ASSISTANT_BATCH_KINDS = ["veille", "prospection"] as const;
export type AssistantBatchKind = (typeof ASSISTANT_BATCH_KINDS)[number];

export const ASSISTANT_ITEM_STATUSES = ["new", "used", "dismissed"] as const;
export type AssistantItemStatus = (typeof ASSISTANT_ITEM_STATUSES)[number];

export type AssistantItemRecord = {
  id: string;
  batchId: string;
  title: string;
  summary: string | null;
  detail: string | null;
  sourceUrl: string | null;
  commercialAction: string | null;
  draftEmailSubject: string | null;
  draftEmailBody: string | null;
  externalKey: string | null;
  status: AssistantItemStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AssistantBatchRecord = {
  id: string;
  kind: AssistantBatchKind;
  title: string | null;
  periodLabel: string | null;
  createdAt: Date;
  items: AssistantItemRecord[];
};
