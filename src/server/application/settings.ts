import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/server/domain/errors";
import type { CatalogOfferRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { getOperationalFees } from "./fees";
import {
  adminFeesUpdateSchema,
  adminProfileUpdateSchema,
} from "./schemas";

export type AdminSettings = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  fees: {
    setupCents: number;
    hostingCents: number;
    tjmCents: number;
  };
  offers: CatalogOfferRecord[];
};

export async function getOperationalTjmCents(): Promise<number> {
  const fees = await getOperationalFees();
  return fees.tjmCents;
}

export async function getAdminSettings(
  userId: string,
): Promise<AdminSettings> {
  const user = await deps.users.findById(userId);
  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Accès réservé");
  }

  const [fees, offers] = await Promise.all([
    getOperationalFees(),
    deps.catalog.listActive(),
  ]);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    fees,
    offers,
  };
}

export async function updateAdminProfile(
  userId: string,
  input: unknown,
): Promise<void> {
  const parsed = adminProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }

  const user = await deps.users.findById(userId);
  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Accès réservé");
  }

  await deps.users.updateProfile(userId, {
    name: parsed.data.name.trim() || null,
  });

  await deps.audit.append({
    userId,
    action: "admin.profile_updated",
    entity: "User",
    entityId: userId,
  });
}

export async function updateAdminFees(
  userId: string,
  input: unknown,
): Promise<void> {
  const parsed = adminFeesUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }

  const user = await deps.users.findById(userId);
  if (!user || user.role !== "admin") {
    throw new UnauthorizedError("Accès réservé");
  }

  const { setupEuros, hostingEuros, tjmEuros } = parsed.data;

  const setup = await deps.catalog.findByKind("setup");
  const hosting = await deps.catalog.findByKind("hosting");
  const tjm = await deps.catalog.findByKind("custom");
  if (!setup || !hosting || !tjm) {
    throw new NotFoundError("Offre catalogue");
  }

  const setupCents = Math.round(setupEuros * 100);
  const hostingCents = Math.round(hostingEuros * 100);
  const tjmCents = Math.round(tjmEuros * 100);

  await Promise.all([
    deps.catalog.updatePrice(
      "setup",
      setupCents,
      `Frais uniques de conception et mise en ligne (vitrine) — ${setupEuros} €`,
    ),
    deps.catalog.updatePrice(
      "hosting",
      hostingCents,
      `Hébergement chez CodeByToma — ${hostingEuros} €/mois (sans modifications)`,
    ),
    deps.catalog.updatePrice(
      "custom",
      tjmCents,
      `Évolutions, améliorations et sur-mesure — ${tjmEuros} €/jour`,
    ),
  ]);

  await deps.audit.append({
    userId,
    action: "admin.fees_updated",
    entity: "CatalogOffer",
    metadata: { setupCents, hostingCents, tjmCents },
  });
}
