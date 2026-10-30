import {
  HOSTING_FEE_CENTS,
  SETUP_FEE_CENTS,
  TJM_FEE_CENTS,
} from "@/data/fees";
import { deps } from "./container";

export type OperationalFees = {
  setupCents: number;
  hostingCents: number;
  tjmCents: number;
};

const DEFAULTS: OperationalFees = {
  setupCents: SETUP_FEE_CENTS,
  hostingCents: HOSTING_FEE_CENTS,
  tjmCents: TJM_FEE_CENTS,
};

async function priceOrDefault(
  kind: "setup" | "hosting" | "custom",
  fallback: number,
): Promise<number> {
  try {
    const offer = await deps.catalog.findByKind(kind);
    return offer?.priceCents ?? fallback;
  } catch {
    return fallback;
  }
}

/** Source unique runtime : catalogue BDD, sinon défauts `fees.ts`. */
export async function getOperationalFees(): Promise<OperationalFees> {
  const [setupCents, hostingCents, tjmCents] = await Promise.all([
    priceOrDefault("setup", DEFAULTS.setupCents),
    priceOrDefault("hosting", DEFAULTS.hostingCents),
    priceOrDefault("custom", DEFAULTS.tjmCents),
  ]);
  return { setupCents, hostingCents, tjmCents };
}

export function feesToEuros(fees: OperationalFees) {
  return {
    setup: fees.setupCents / 100,
    hosting: fees.hostingCents / 100,
    tjm: fees.tjmCents / 100,
  };
}
