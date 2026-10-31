import { NextResponse } from "next/server";
import { assertAssistantIngestAuthorized } from "@/server/application/assistant";
import { getFinanceSnapshot } from "@/server/application/finance";
import { assistantErrorResponse } from "../_errors";

export const runtime = "nodejs";

/** GET — snapshot financier (lecture seule, données minimales). */
export async function GET(request: Request) {
  try {
    assertAssistantIngestAuthorized(request.headers.get("authorization"));
    const snapshot = await getFinanceSnapshot();
    return NextResponse.json({ ok: true, finance: snapshot });
  } catch (e) {
    return assistantErrorResponse(e);
  }
}
