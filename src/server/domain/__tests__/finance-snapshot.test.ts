import { describe, expect, it } from "vitest";
import {
  computeExpectedRevenueCents,
  invoiceDaysLate,
  quoteAgeDays,
} from "../finance-snapshot";

describe("computeExpectedRevenueCents", () => {
  it("additionne devis en attente et MRR", () => {
    expect(
      computeExpectedRevenueCents({
        pendingQuotesTotalCents: 149_00,
        monthlyRecurringCents: 30_00,
      }),
    ).toBe(179_00);
  });
});

describe("quoteAgeDays", () => {
  const now = new Date("2026-10-10T12:00:00.000Z");

  it("mesure depuis sentAt", () => {
    expect(
      quoteAgeDays(new Date("2026-10-07"), new Date("2026-10-01"), now),
    ).toBe(3);
  });
});

describe("invoiceDaysLate", () => {
  const now = new Date("2026-10-10");

  it("retourne null si pas en retard", () => {
    expect(invoiceDaysLate(new Date("2026-10-15"), now)).toBeNull();
  });

  it("compte les jours de retard", () => {
    expect(invoiceDaysLate(new Date("2026-10-01"), now)).toBe(9);
  });
});
