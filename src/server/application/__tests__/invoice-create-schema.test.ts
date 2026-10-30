import { describe, expect, it } from "vitest";
import { invoiceCreateSchema } from "../schemas";

describe("invoiceCreateSchema", () => {
  const base = {
    clientId: "client_1",
    lines: [
      {
        label: "Création",
        quantity: 1,
        unitPriceHtCents: 14900,
        taxRatePercent: 0,
      },
    ],
  };

  it("exige un quoteId", () => {
    const result = invoiceCreateSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it("accepte un devis lié", () => {
    const result = invoiceCreateSchema.safeParse({
      ...base,
      quoteId: "quote_1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quoteId).toBe("quote_1");
    }
  });
});
