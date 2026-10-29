import { describe, expect, it } from "vitest";
import { validatePasswordPolicy } from "../password-policy";

describe("validatePasswordPolicy", () => {
  it("accepte un mot de passe conforme", () => {
    expect(validatePasswordPolicy("ChangeMe-Strong1").ok).toBe(true);
  });

  it("refuse trop court", () => {
    const r = validatePasswordPolicy("Ab1short");
    expect(r.ok).toBe(false);
  });

  it("refuse sans majuscule", () => {
    const r = validatePasswordPolicy("changeme-strong1");
    expect(r.ok).toBe(false);
  });

  it("refuse sans chiffre", () => {
    const r = validatePasswordPolicy("ChangeMe-Strong");
    expect(r.ok).toBe(false);
  });
});
