import {
  NotFoundError,
  ValidationError,
} from "@/server/domain/errors";
import type {
  BotTaskRecord,
  BotTaskResponsible,
  BotTaskStatus,
} from "@/server/domain/tasks";
import { deps } from "./container";
import {
  assistantTaskCreateSchema,
  assistantTaskPatchSchema,
  botTaskUpdateSchema,
  botTaskUpsertSchema,
} from "./schemas";

export async function listBotTasks(filters?: {
  status?: BotTaskStatus;
  responsible?: BotTaskResponsible;
}): Promise<BotTaskRecord[]> {
  return deps.botTasks.list(filters);
}

export async function getBotTask(id: string): Promise<BotTaskRecord> {
  const task = await deps.botTasks.findById(id);
  if (!task) throw new NotFoundError("Tâche", id);
  return task;
}

export async function createBotTaskManual(input: unknown): Promise<BotTaskRecord> {
  const parsed = botTaskUpsertSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }
  if (parsed.data.clientId) {
    const client = await deps.clients.findById(parsed.data.clientId);
    if (!client) throw new NotFoundError("Client", parsed.data.clientId);
  }
  return deps.botTasks.create({
    title: parsed.data.title,
    detail: parsed.data.detail ?? null,
    responsible: parsed.data.responsible,
    status: parsed.data.status ?? "todo",
    dueAt: parsed.data.dueAt ?? null,
    clientId: parsed.data.clientId ?? null,
  });
}

export async function updateBotTaskManual(
  id: string,
  input: unknown,
): Promise<BotTaskRecord> {
  const parsed = botTaskUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }
  const existing = await deps.botTasks.findById(id);
  if (!existing) throw new NotFoundError("Tâche", id);

  if (parsed.data.clientId) {
    const client = await deps.clients.findById(parsed.data.clientId);
    if (!client) throw new NotFoundError("Client", parsed.data.clientId);
  }

  return deps.botTasks.update(id, parsed.data);
}

export async function setBotTaskStatus(
  id: string,
  status: BotTaskStatus,
): Promise<BotTaskRecord> {
  const existing = await deps.botTasks.findById(id);
  if (!existing) throw new NotFoundError("Tâche", id);
  return deps.botTasks.update(id, { status });
}

export async function createAssistantTask(input: unknown): Promise<BotTaskRecord> {
  const parsed = assistantTaskCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Payload invalide",
    );
  }
  if (parsed.data.externalId) {
    const dup = await deps.botTasks.findByExternalId(parsed.data.externalId);
    if (dup) {
      throw new ValidationError(
        "Une tâche avec cet externalId existe déjà — utilisez PATCH.",
      );
    }
  }
  if (parsed.data.clientId) {
    const client = await deps.clients.findById(parsed.data.clientId);
    if (!client) throw new NotFoundError("Client", parsed.data.clientId);
  }
  const task = await deps.botTasks.create(parsed.data);
  await deps.audit.append({
    action: "assistant.task_created",
    entity: "BotTask",
    entityId: task.id,
    metadata: { externalId: task.externalId, responsible: task.responsible },
  });
  return task;
}

/** PATCH idempotent par externalId (crée si absent). */
export async function patchAssistantTask(input: unknown): Promise<BotTaskRecord> {
  const parsed = assistantTaskPatchSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Payload invalide",
    );
  }
  const { externalId, ...fields } = parsed.data;
  if (fields.clientId) {
    const client = await deps.clients.findById(fields.clientId);
    if (!client) throw new NotFoundError("Client", fields.clientId);
  }

  const existing = await deps.botTasks.findByExternalId(externalId);
  if (!existing) {
    if (!fields.title || !fields.responsible) {
      throw new ValidationError(
        "Création via PATCH : title et responsible sont requis.",
      );
    }
    const task = await deps.botTasks.upsertByExternalId(
      externalId,
      {
        externalId,
        title: fields.title,
        detail: fields.detail ?? null,
        responsible: fields.responsible,
        status: fields.status ?? "todo",
        dueAt: fields.dueAt ?? null,
        clientId: fields.clientId ?? null,
      },
      {},
    );
    await deps.audit.append({
      action: "assistant.task_upserted",
      entity: "BotTask",
      entityId: task.id,
      metadata: { externalId, created: true },
    });
    return task;
  }

  const task = await deps.botTasks.upsertByExternalId(
    externalId,
    {
      externalId,
      title: fields.title ?? existing.title,
      responsible: fields.responsible ?? existing.responsible,
      detail: fields.detail ?? existing.detail,
      status: fields.status ?? existing.status,
      dueAt: fields.dueAt ?? existing.dueAt,
      clientId: fields.clientId ?? existing.clientId,
    },
    {
      ...(fields.title !== undefined ? { title: fields.title } : {}),
      ...(fields.detail !== undefined ? { detail: fields.detail } : {}),
      ...(fields.responsible !== undefined
        ? { responsible: fields.responsible }
        : {}),
      ...(fields.status !== undefined ? { status: fields.status } : {}),
      ...(fields.dueAt !== undefined ? { dueAt: fields.dueAt } : {}),
      ...(fields.clientId !== undefined ? { clientId: fields.clientId } : {}),
    },
  );
  await deps.audit.append({
    action: "assistant.task_upserted",
    entity: "BotTask",
    entityId: task.id,
    metadata: { externalId, created: false },
  });
  return task;
}

export async function listAssistantTasks(filters?: {
  status?: BotTaskStatus;
  responsible?: BotTaskResponsible;
}): Promise<BotTaskRecord[]> {
  return deps.botTasks.list(filters);
}
