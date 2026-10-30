import { assertCents, type MoneyCents } from "@/lib/money";

export type LineInput = {
  quantity: number;
  unitPriceHtCents: MoneyCents;
  /** Taux TVA en % (ex. 20 pour 20 %). Micro-entreprise FR souvent 0. */
  taxRatePercent: number;
};

export type LineTotals = {
  htCents: MoneyCents;
  taxCents: MoneyCents;
  ttcCents: MoneyCents;
};

export type DocumentTotals = {
  subtotalCents: MoneyCents;
  taxCents: MoneyCents;
  totalCents: MoneyCents;
  lines: LineTotals[];
};

/**
 * Calcule HT / TVA / TTC pour une ligne, arrondi au centime le plus proche.
 */
export function calculateLineTotals(line: LineInput): LineTotals {
  if (line.quantity <= 0) {
    throw new Error("La quantité doit être > 0");
  }
  if (line.taxRatePercent < 0 || line.taxRatePercent > 100) {
    throw new Error("Taux de TVA invalide");
  }
  assertCents(line.unitPriceHtCents, "prix unitaire HT");

  const htCents = Math.round(line.quantity * line.unitPriceHtCents);
  const taxCents = Math.round((htCents * line.taxRatePercent) / 100);
  const ttcCents = htCents + taxCents;

  return { htCents, taxCents, ttcCents };
}

/** Totaux document = somme des lignes (jamais faire confiance au client HTTP). */
export function calculateDocumentTotals(lines: LineInput[]): DocumentTotals {
  if (lines.length === 0) {
    return { subtotalCents: 0, taxCents: 0, totalCents: 0, lines: [] };
  }

  const lineTotals = lines.map(calculateLineTotals);
  const subtotalCents = lineTotals.reduce((sum, l) => sum + l.htCents, 0);
  const taxCents = lineTotals.reduce((sum, l) => sum + l.taxCents, 0);
  const totalCents = subtotalCents + taxCents;

  return { subtotalCents, taxCents, totalCents, lines: lineTotals };
}
