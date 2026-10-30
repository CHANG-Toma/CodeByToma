/** Montants métier en centimes (integer). Safe client + serveur. */
export type MoneyCents = number;

export function assertCents(value: number, label = "montant"): MoneyCents {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} invalide : attendu un entier >= 0 en centimes`);
  }
  return value;
}

export function formatEur(cents: MoneyCents): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
