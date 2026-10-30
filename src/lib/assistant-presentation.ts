import type { AssistantItemRecord } from "@/server/domain/assistant";

export type ProspectSignal = {
  label: string;
  tone: "neutral" | "warn" | "info";
};

/**
 * The ingest contract has no dedicated prospect category. Keep presentation
 * hints conservative and derive them only from wording Nori already supplied.
 */
export function getProspectSignal(
  item: Pick<AssistantItemRecord, "title" | "summary" | "detail">,
): ProspectSignal {
  const text = [item.title, item.summary, item.detail]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (/\b(pas de site|sans site|aucun site)\b/.test(text)) {
    return { label: "Pas de site", tone: "warn" };
  }

  if (
    /\b(site\b.{0,32}\b(date|vieillissant|obsolete|non responsive)|pas adapte aux mobiles)\b/.test(
      text,
    )
  ) {
    return { label: "Site à moderniser", tone: "info" };
  }

  return { label: "À qualifier", tone: "neutral" };
}
