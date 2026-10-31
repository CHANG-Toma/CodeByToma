import { NextResponse } from "next/server";
import { DomainError } from "@/server/domain/errors";

export function assistantErrorResponse(e: unknown) {
  if (e instanceof DomainError) {
    const status =
      e.name === "UnauthorizedError"
        ? 401
        : e.name === "ValidationError"
          ? 400
          : e.name === "NotFoundError"
            ? 404
            : 400;
    return NextResponse.json({ ok: false, error: e.message }, { status });
  }
  return NextResponse.json(
    { ok: false, error: "Une erreur est survenue" },
    { status: 500 },
  );
}
