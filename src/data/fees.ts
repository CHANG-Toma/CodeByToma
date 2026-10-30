/**
 * Montants catalogue en centimes — source unique pour domaine + marketing + UI.
 * (évite domaine → pricing et les doublons dans LinesEditor)
 */
export const SETUP_FEE_CENTS = 14_900;
export const HOSTING_FEE_CENTS = 3_000;
export const TJM_FEE_CENTS = 38_000;
export const TJM_HALF_DAY_CENTS = 19_000;

export const SETUP_FEE_EUR = SETUP_FEE_CENTS / 100;
export const HOSTING_FEE_EUR = HOSTING_FEE_CENTS / 100;
export const TJM_FEE_EUR = TJM_FEE_CENTS / 100;
