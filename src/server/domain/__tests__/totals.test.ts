import { describe, expect, it } from "vitest";
import { calculateDocumentTotals, calculateLineTotals } from "../totals";

describe("calculateLineTotals", () => {
  it("calcule HT / TVA / TTC sans TVA", () => {
    const result = calculateLineTotals({
      quantity: 1,
      unitPriceHtCents: 14900,
      taxRatePercent: 0,
    });
    expect(result).toEqual({
      htCents: 14900,
      taxCents: 0,
      ttcCents: 14900,
    });
  });

  it("calcule la TVA 20 % avec arrondi", () => {
    const result = calculateLineTotals({
      quantity: 2,
      unitPriceHtCents: 4900,
      taxRatePercent: 20,
    });
    expect(result.htCents).toBe(9800);
    expect(result.taxCents).toBe(1960);
    expect(result.ttcCents).toBe(11760);
  });

  it("rejette une quantité invalide", () => {
    expect(() =>
      calculateLineTotals({
        quantity: 0,
        unitPriceHtCents: 100,
        taxRatePercent: 0,
      }),
    ).toThrow();
  });
});

describe("calculateDocumentTotals", () => {
  it("somme plusieurs lignes (création + abo)", () => {
    const totals = calculateDocumentTotals([
      { quantity: 1, unitPriceHtCents: 14900, taxRatePercent: 0 },
      { quantity: 1, unitPriceHtCents: 6500, taxRatePercent: 0 },
    ]);
    expect(totals.subtotalCents).toBe(21400);
    expect(totals.taxCents).toBe(0);
    expect(totals.totalCents).toBe(21400);
  });

  it("retourne zéro pour un document vide", () => {
    expect(calculateDocumentTotals([])).toEqual({
      subtotalCents: 0,
      taxCents: 0,
      totalCents: 0,
      lines: [],
    });
  });
});
