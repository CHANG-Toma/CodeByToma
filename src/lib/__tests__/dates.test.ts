import { describe, expect, it } from "vitest";
import { addYears, defaultQuoteValidUntil, toDateInputValue } from "@/lib/dates";

describe("defaultQuoteValidUntil", () => {
  it("ajoute un an", () => {
    const from = new Date(2026, 9, 30);
    expect(defaultQuoteValidUntil(from)).toBe("2027-10-30");
    expect(toDateInputValue(addYears(from, 1))).toBe("2027-10-30");
  });
});
