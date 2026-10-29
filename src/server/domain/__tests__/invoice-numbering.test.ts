import { describe, expect, it } from "vitest";
import {
  formatInvoiceNumber,
  formatQuoteNumber,
  parseInvoiceNumber,
} from "../invoice-numbering";

describe("formatInvoiceNumber", () => {
  it("formate FAC-YYYY-NNNN", () => {
    expect(formatInvoiceNumber(2026, 1)).toBe("FAC-2026-0001");
    expect(formatInvoiceNumber(2026, 42)).toBe("FAC-2026-0042");
  });

  it("rejette un séquentiel invalide", () => {
    expect(() => formatInvoiceNumber(2026, 0)).toThrow();
  });
});

describe("formatQuoteNumber", () => {
  it("formate DEV-YYYY-NNNN", () => {
    expect(formatQuoteNumber(2026, 7)).toBe("DEV-2026-0007");
  });
});

describe("parseInvoiceNumber", () => {
  it("parse un numéro valide", () => {
    expect(parseInvoiceNumber("FAC-2026-0012")).toEqual({
      year: 2026,
      sequential: 12,
    });
  });

  it("retourne null si invalide", () => {
    expect(parseInvoiceNumber("INV-1")).toBeNull();
  });
});
