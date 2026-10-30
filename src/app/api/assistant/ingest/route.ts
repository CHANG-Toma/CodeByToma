import { NextResponse } from "next/server";
import {
  assertAssistantIngestAuthorized,
  ingestAssistantBatch,
  listKnownProspectKeys,
} from "@/server/application/assistant";
import { DomainError } from "@/server/domain/errors";

export const runtime = "nodejs";

function errorResponse(e: unknown) {
  if (e instanceof DomainError) {
    const status =
      e.name === "UnauthorizedError"
        ? 401
        : e.name === "ValidationError"
          ? 400
          : 400;
    return NextResponse.json({ ok: false, error: e.message }, { status });
  }
  return NextResponse.json(
    { ok: false, error: "Une erreur est survenue" },
    { status: 500 },
  );
}

/** POST : déposer veille / prospection. Header Authorization: Bearer <ASSISTANT_INGEST_SECRET> */
export async function POST(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const body = await request.json();
    const result = await ingestAssistantBatch(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return errorResponse(e);
  }
}

/** GET : liste des externalKey déjà connus (pour éviter les doublons côté assistant). */
export async function GET(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const keys = await listKnownProspectKeys();
    return NextResponse.json({ ok: true, externalKeys: keys });
  } catch (e) {
    return errorResponse(e);
  }
}
