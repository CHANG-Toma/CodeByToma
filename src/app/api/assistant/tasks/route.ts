import { NextResponse } from "next/server";
import {
  assertAssistantIngestAuthorized,
} from "@/server/application/assistant";
import {
  createAssistantTask,
  listAssistantTasks,
  patchAssistantTask,
} from "@/server/application/tasks";
import {
  BOT_TASK_RESPONSIBLES,
  BOT_TASK_STATUSES,
  type BotTaskResponsible,
  type BotTaskStatus,
} from "@/server/domain/tasks";
import { ValidationError } from "@/server/domain/errors";
import { assistantErrorResponse } from "../_errors";

export const runtime = "nodejs";

function parseFilters(url: URL) {
  const status = url.searchParams.get("status");
  const responsible =
    url.searchParams.get("responsible") ?? url.searchParams.get("bot");
  if (status && !BOT_TASK_STATUSES.includes(status as BotTaskStatus)) {
    throw new ValidationError("Filtre status invalide");
  }
  if (
    responsible &&
    !BOT_TASK_RESPONSIBLES.includes(responsible as BotTaskResponsible)
  ) {
    throw new ValidationError("Filtre responsible invalide");
  }
  return {
    status: status as BotTaskStatus | null,
    responsible: responsible as BotTaskResponsible | null,
  };
}

/** GET — liste des tâches (filtres optionnels status, responsible/bot). */
export async function GET(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const { status, responsible } = parseFilters(new URL(request.url));
    const tasks = await listAssistantTasks({
      ...(status ? { status } : {}),
      ...(responsible ? { responsible } : {}),
    });
    return NextResponse.json({ ok: true, tasks });
  } catch (e) {
    return assistantErrorResponse(e);
  }
}

/** POST — créer une tâche (externalId optionnel). */
export async function POST(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const body = await request.json();
    const task = await createAssistantTask(body);
    return NextResponse.json({ ok: true, task });
  } catch (e) {
    return assistantErrorResponse(e);
  }
}

/** PATCH — mise à jour idempotente par externalId. */
export async function PATCH(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const body = await request.json();
    const task = await patchAssistantTask(body);
    return NextResponse.json({ ok: true, task });
  } catch (e) {
    return assistantErrorResponse(e);
  }
}
