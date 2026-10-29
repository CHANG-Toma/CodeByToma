import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * IP client pour rate-limit. Ne jamais logger cette valeur avec de la PII.
 * Derrière un reverse proxy, on lit X-Forwarded-For (premier hop).
 */
export async function getClientIpKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const raw =
    (forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown").slice(
      0,
      64,
    );

  // Empreinte : on ne stocke pas l'IP en clair dans les structures de rate-limit exposables
  return createHash("sha256").update(`ip:${raw}`).digest("hex").slice(0, 32);
}

export function hashRateLimitSubject(subject: string): string {
  return createHash("sha256")
    .update(`sub:${subject.toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}
