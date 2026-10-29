import { describe, expect, it } from "vitest";
import {
  assertInvoiceTransition,
  assertQuoteTransition,
  canTransitionInvoice,
  canTransitionQuote,
  invoiceStatusAfterPayment,
} from "../status-transitions";

describe("transitions devis", () => {
  it("autorise draft → sent → accepted", () => {
    expect(canTransitionQuote("draft", "sent")).toBe(true);
    expect(canTransitionQuote("sent", "accepted")).toBe(true);
  });

  it("interdit accepted → draft", () => {
    expect(canTransitionQuote("accepted", "draft")).toBe(false);
    expect(() => assertQuoteTransition("accepted", "draft")).toThrow(
      /interdite/,
    );
  });
});

describe("transitions facture", () => {
  it("autorise draft → issued → paid", () => {
    expect(canTransitionInvoice("draft", "issued")).toBe(true);
    expect(canTransitionInvoice("issued", "paid")).toBe(true);
  });

  it("interdit paid → cancelled", () => {
    expect(canTransitionInvoice("paid", "cancelled")).toBe(false);
    expect(() => assertInvoiceTransition("paid", "cancelled")).toThrow(
      /interdite/,
    );
  });
});

describe("invoiceStatusAfterPayment", () => {
  it("passe en paid si montant couvert", () => {
    expect(invoiceStatusAfterPayment("issued", 21400, 21400)).toBe("paid");
  });

  it("passe en partially_paid si acompte", () => {
    expect(invoiceStatusAfterPayment("issued", 21400, 10000)).toBe(
      "partially_paid",
    );
  });

  it("refuse un paiement sur draft", () => {
    expect(() => invoiceStatusAfterPayment("draft", 100, 50)).toThrow();
  });
});
