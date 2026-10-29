/**
 * Politique de mot de passe (recommandations ANSSI / bonnes pratiques CNIL) :
 * longueur ≥ 12, mélange majuscule / minuscule / chiffre.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
    };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      message: `Le mot de passe ne doit pas dépasser ${PASSWORD_MAX_LENGTH} caractères.`,
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      ok: false,
      message: "Le mot de passe doit contenir au moins une minuscule.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      ok: false,
      message: "Le mot de passe doit contenir au moins une majuscule.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      ok: false,
      message: "Le mot de passe doit contenir au moins un chiffre.",
    };
  }
  return { ok: true };
}
