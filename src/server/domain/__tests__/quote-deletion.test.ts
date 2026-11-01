import { describe, expect, it } from "vitest";
import { planQuoteDeletion } from "../quote-deletion";

describe("planQuoteDeletion", () => {
  it("autorise un devis sans facture", () => {
    expect(planQuoteDeletion([])).toEqual({
      allowed: true,
      invoiceIdsToRemove: [],
    });
  });

  it("autorise la suppression avec facture brouillon sans paiement", () => {
    expect(
      planQuoteDeletion([
        { id: "inv-1", status: "draft", paymentCount: 0 },
      ]),
    ).toEqual({
      allowed: true,
      invoiceIdsToRemove: ["inv-1"],
    });
  });

  it("refuse si un paiement existe", () => {
    const plan = planQuoteDeletion([
      { id: "inv-1", status: "draft", paymentCount: 1 },
    ]);
    expect(plan.allowed).toBe(false);
    if (!plan.allowed) {
      expect(plan.message).toMatch(/paiement/i);
    }
  });

  it("refuse si une facture est émise", () => {
    const plan = planQuoteDeletion([
      { id: "inv-1", status: "issued", paymentCount: 0 },
    ]);
    expect(plan.allowed).toBe(false);
    if (!plan.allowed) {
      expect(plan.message).toMatch(/facture émise/i);
    }
  });
});
