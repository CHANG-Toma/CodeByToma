/**
 * Numérotation facture monotone : FAC-YYYY-NNNN
 * Le compteur est géré côté infrastructure (transaction + InvoiceSequence).
 */
export function formatInvoiceNumber(year: number, sequential: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Année de facture invalide");
  }
  if (!Number.isInteger(sequential) || sequential < 1) {
    throw new Error("Numéro séquentiel invalide");
  }
  const padded = String(sequential).padStart(4, "0");
  return `FAC-${year}-${padded}`;
}

export function formatQuoteNumber(year: number, sequential: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Année de devis invalide");
  }
  if (!Number.isInteger(sequential) || sequential < 1) {
    throw new Error("Numéro séquentiel devis invalide");
  }
  const padded = String(sequential).padStart(4, "0");
  return `DEV-${year}-${padded}`;
}

export function parseInvoiceNumber(
  number: string,
): { year: number; sequential: number } | null {
  const match = /^FAC-(\d{4})-(\d+)$/.exec(number);
  if (!match) return null;
  return {
    year: Number(match[1]),
    sequential: Number(match[2]),
  };
}
