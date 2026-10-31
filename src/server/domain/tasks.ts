export const BOT_TASK_RESPONSIBLES = [
  "ceo_finance",
  "commercial_tech",
  "marketing",
  "toma",
] as const;

export type BotTaskResponsible = (typeof BOT_TASK_RESPONSIBLES)[number];

export const BOT_TASK_STATUSES = [
  "todo",
  "in_progress",
  "to_validate",
  "done",
  "blocked",
] as const;

export type BotTaskStatus = (typeof BOT_TASK_STATUSES)[number];

export const BOT_TASK_RESPONSIBLE_LABEL: Record<BotTaskResponsible, string> = {
  ceo_finance: "CEO & Finance",
  commercial_tech: "Commercial & Tech",
  marketing: "Marketing",
  toma: "Toma",
};

export const BOT_TASK_STATUS_LABEL: Record<BotTaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  to_validate: "À valider",
  done: "Terminé",
  blocked: "Bloqué",
};

export type BotTaskRecord = {
  id: string;
  externalId: string | null;
  title: string;
  detail: string | null;
  responsible: BotTaskResponsible;
  status: BotTaskStatus;
  dueAt: Date | null;
  clientId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
