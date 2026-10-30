import { describe, expect, it } from "vitest";
import {
  buildMailtoHref,
  buildReminderDraft,
} from "../reminder-templates";

describe("buildReminderDraft", () => {
  it("génère une relance devis", () => {
    const draft = buildReminderDraft({
      kind: "quote_follow_up",
      clientName: "Alice",
      documentNumber: "D-2026-001",
      amountCents: 14900,
      dueOrValidUntil: null,
      issuerName: "CodeByToma",
    });
    expect(draft.subject).toContain("D-2026-001");
    expect(draft.text).toContain("Alice");
    expect(draft.text).toContain("149");
  });

  it("génère une relance facture", () => {
    const draft = buildReminderDraft({
      kind: "invoice_overdue",
      clientName: "Bob",
      documentNumber: "F-2026-010",
      amountCents: 3000,
      dueOrValidUntil: new Date("2026-10-01"),
      issuerName: "CodeByToma",
    });
    expect(draft.subject).toContain("F-2026-010");
    expect(draft.text).toContain("échéance");
  });
});

describe("buildMailtoHref", () => {
  it("encode subject et body", () => {
    const href = buildMailtoHref("a@b.fr", "Sujet", "Corps\nligne 2");
    expect(href.startsWith("mailto:")).toBe(true);
    expect(href).toContain("subject=");
    expect(href).toContain("body=");
  });
});
