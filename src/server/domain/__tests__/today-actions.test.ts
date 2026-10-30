import { describe, expect, it } from "vitest";
import {
  isInvoiceOverdue,
  isQuoteExpired,
  isQuoteExpiringSoon,
  isQuoteFollowUpDue,
  isSubscriptionDueSoon,
  sortTodayActions,
  type TodayAction,
} from "../today-actions";

const now = new Date("2026-10-30T12:00:00.000Z");

describe("isInvoiceOverdue", () => {
  it("détecte le statut overdue", () => {
    expect(
      isInvoiceOverdue({ status: "overdue", dueAt: null, now }),
    ).toBe(true);
  });

  it("détecte une facture émise dont l’échéance est passée", () => {
    expect(
      isInvoiceOverdue({
        status: "issued",
        dueAt: new Date("2026-10-01"),
        now,
      }),
    ).toBe(true);
  });

  it("ignore une facture payée", () => {
    expect(
      isInvoiceOverdue({
        status: "paid",
        dueAt: new Date("2026-10-01"),
        now,
      }),
    ).toBe(false);
  });
});

describe("isQuoteFollowUpDue", () => {
  it("relance après 7 jours", () => {
    expect(
      isQuoteFollowUpDue({
        status: "sent",
        sentAt: new Date("2026-10-20"),
        createdAt: new Date("2026-10-20"),
        validUntil: new Date("2026-11-30"),
        now,
      }),
    ).toBe(true);
  });

  it("ne relance pas un devis encore frais", () => {
    expect(
      isQuoteFollowUpDue({
        status: "sent",
        sentAt: new Date("2026-10-28"),
        createdAt: new Date("2026-10-28"),
        validUntil: null,
        now,
      }),
    ).toBe(false);
  });

  it("ne double pas un devis déjà expiré", () => {
    expect(
      isQuoteFollowUpDue({
        status: "sent",
        sentAt: new Date("2026-09-01"),
        createdAt: new Date("2026-09-01"),
        validUntil: new Date("2026-10-01"),
        now,
      }),
    ).toBe(false);
    expect(
      isQuoteExpired({
        status: "sent",
        validUntil: new Date("2026-10-01"),
        now,
      }),
    ).toBe(true);
  });
});

describe("isQuoteExpiringSoon", () => {
  it("signale une expiration dans la fenêtre", () => {
    expect(
      isQuoteExpiringSoon({
        status: "sent",
        validUntil: new Date("2026-11-03"),
        now,
      }),
    ).toBe(true);
  });
});

describe("isSubscriptionDueSoon", () => {
  it("signale une échéance proche ou passée", () => {
    expect(
      isSubscriptionDueSoon({
        status: "active",
        nextBillingDate: new Date("2026-11-02"),
        now,
      }),
    ).toBe(true);
  });
});

describe("sortTodayActions", () => {
  it("trie par priorité puis échéance", () => {
    const actions: TodayAction[] = [
      {
        id: "b",
        kind: "quote_follow_up",
        priority: 4,
        title: "B",
        detail: "",
        href: "",
        dueAt: null,
        amountCents: null,
        clientId: null,
        clientLabel: null,
      },
      {
        id: "a",
        kind: "invoice_overdue",
        priority: 1,
        title: "A",
        detail: "",
        href: "",
        dueAt: null,
        amountCents: null,
        clientId: null,
        clientLabel: null,
      },
    ];
    expect(sortTodayActions(actions).map((a) => a.id)).toEqual(["a", "b"]);
  });
});
