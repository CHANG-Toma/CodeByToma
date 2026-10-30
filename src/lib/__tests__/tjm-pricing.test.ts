import { describe, expect, it } from "vitest";
import { TJM_FEE_CENTS } from "@/data/fees";
import {
  hoursBetween,
  labelFromSlot,
  priceFromHours,
  priceFromSlot,
  priceFullDay,
  priceHalfDay,
} from "@/lib/tjm-pricing";

describe("priceFullDay / priceHalfDay", () => {
  it("journée = TJM", () => {
    expect(priceFullDay()).toBe(TJM_FEE_CENTS);
  });

  it("demi-journée = TJM / 2", () => {
    expect(priceHalfDay()).toBe(19_000);
  });
});

describe("priceFromHours", () => {
  it("prorata 3 h sur 7 h", () => {
    // 38000 * 3 / 7 = 16285.714… → 16286
    expect(priceFromHours(3)).toBe(16_286);
  });

  it("journée complète en heures", () => {
    expect(priceFromHours(7)).toBe(TJM_FEE_CENTS);
  });
});

describe("hoursBetween / priceFromSlot", () => {
  it("matin 9–12 = 3 h", () => {
    expect(hoursBetween(9, 12)).toBe(3);
    expect(priceFromSlot("9:00", "12:00")).toEqual({
      hours: 3,
      priceCents: 16_286,
    });
  });

  it("après-midi 14–18 = 4 h", () => {
    expect(priceFromSlot(14, 18).hours).toBe(4);
    expect(priceFromSlot(14, 18).priceCents).toBe(
      Math.round((TJM_FEE_CENTS * 4) / 7),
    );
  });

  it("libellé créneau", () => {
    expect(labelFromSlot(9, 12)).toBe("Prestation TJM — 9h–12h (3 h)");
  });
});
