import { describe, expect, it } from "vitest";
import { buildTodayReminderDraft } from "../today-reminder-draft";

describe("buildTodayReminderDraft", () => {
  it("produit un brouillon pour un devis à relancer", () => {
    const draft = buildTodayReminderDraft({
      kind: "quote_follow_up",
      clientName: "Alice",
      clientEmail: "alice@example.com",
      documentNumber: "DEV-2026-001",
      amountCents: 149_00,
      dueOrValidUntil: null,
    });
    expect(draft?.subject).toContain("DEV-2026-001");
    expect(draft?.mailtoHref).toContain("mailto:alice@example.com");
  });

  it("ignore les actions non relançables", () => {
    expect(
      buildTodayReminderDraft({
        kind: "subscription_due",
        clientName: "Bob",
        clientEmail: "bob@example.com",
        documentNumber: "x",
        amountCents: 30_00,
        dueOrValidUntil: null,
      }),
    ).toBeUndefined();
  });
});
