import { describe, expect, it, vi } from "vitest";
import { quoteListActions, subscriptionListActions } from "../row-actions";

describe("quoteListActions delete", () => {
  it("ajoute une action Supprimer quand deleteAction est fourni", () => {
    const deleteAction = vi.fn();
    const actions = quoteListActions({
      slug: "studio-x",
      clientId: "c1",
      quoteId: "q1",
      status: "sent",
      deleteAction,
      quoteNumber: "DEV-2026-001",
    });
    const del = actions.find((a) => a.kind === "delete");
    expect(del?.kind).toBe("delete");
    if (del?.kind === "delete") {
      expect(del.label).toBe("Supprimer");
      expect(del.confirmMessage).toContain("DEV-2026-001");
    }
  });
});

describe("subscriptionListActions delete", () => {
  it("ajoute Supprimer avec message en français", () => {
    const actions = subscriptionListActions({
      subscriptionId: "s1",
      label: "Hébergement sérénité",
      status: "active",
      deleteAction: vi.fn(),
    });
    const del = actions.find((a) => a.kind === "delete");
    expect(del?.kind).toBe("delete");
    if (del?.kind === "delete") {
      expect(del.confirmMessage).toContain("Hébergement sérénité");
    }
  });
});
