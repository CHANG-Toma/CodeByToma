import { describe, expect, it } from "vitest";
import { getProspectSignal } from "@/lib/assistant-presentation";

describe("getProspectSignal", () => {
  it("identifie un prospect sans site", () => {
    expect(
      getProspectSignal({
        title: "Restaurant local",
        summary: "Cet établissement n'a pas de site",
        detail: null,
      }),
    ).toEqual({ label: "Pas de site", tone: "warn" });
  });

  it("identifie un site à moderniser malgré les accents", () => {
    expect(
      getProspectSignal({
        title: "Garage",
        summary: null,
        detail: "Le site paraît daté et peu lisible.",
      }),
    ).toEqual({ label: "Site à moderniser", tone: "info" });
  });

  it("reste prudent sans signal explicite", () => {
    expect(
      getProspectSignal({
        title: "Cabinet",
        summary: "Présence locale intéressante",
        detail: null,
      }),
    ).toEqual({ label: "À qualifier", tone: "neutral" });
  });
});
