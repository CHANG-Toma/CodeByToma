import { DEFAULT_COMMITMENT_MONTHS } from "@/server/domain/catalog";
import { NotFoundError, ValidationError } from "@/server/domain/errors";
import {
  assertSubscriptionTransition,
  type SubscriptionStatus,
} from "@/server/domain/status-transitions";
import type { SubscriptionRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { subscriptionCreateSchema, subscriptionStatusSchema } from "./schemas";

export async function listSubscriptions(filters?: {
  clientId?: string;
  status?: SubscriptionStatus;
}): Promise<SubscriptionRecord[]> {
  return deps.subscriptions.list(filters);
}

export async function getSubscription(id: string): Promise<SubscriptionRecord> {
  const sub = await deps.subscriptions.findById(id);
  if (!sub) throw new NotFoundError("Abonnement", id);
  return sub;
}

export async function createSubscription(
  input: unknown,
): Promise<SubscriptionRecord> {
  const parsed = subscriptionCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }

  const client = await deps.clients.findById(parsed.data.clientId);
  if (!client) throw new NotFoundError("Client", parsed.data.clientId);

  const offer = await deps.catalog.findByKind(parsed.data.offerKind);
  if (!offer && parsed.data.offerKind !== "custom") {
    throw new ValidationError("Offre catalogue introuvable");
  }

  const label =
    parsed.data.label ?? offer?.label ?? `Offre ${parsed.data.offerKind}`;
  const priceCents = parsed.data.priceCents ?? offer?.priceCents ?? 0;

  const startDate = parsed.data.startDate;
  const nextBillingDate =
    parsed.data.nextBillingDate ??
    new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
    );

  const commitmentMonths =
    parsed.data.commitmentMonths ?? DEFAULT_COMMITMENT_MONTHS;
  const endDate =
    parsed.data.endDate ??
    new Date(
      startDate.getFullYear(),
      startDate.getMonth() + commitmentMonths,
      startDate.getDate(),
    );

  const sub = await deps.subscriptions.create({
    clientId: parsed.data.clientId,
    offerKind: parsed.data.offerKind,
    label,
    priceCents,
    currency: "EUR",
    status: "active",
    startDate,
    endDate,
    nextBillingDate,
    commitmentMonths,
    notes: parsed.data.notes ?? null,
  });

  await deps.audit.append({
    action: "subscription.created",
    entity: "Subscription",
    entityId: sub.id,
  });

  return sub;
}

export async function transitionSubscription(
  id: string,
  input: unknown,
): Promise<SubscriptionRecord> {
  const parsed = subscriptionStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Statut invalide",
    );
  }
  const sub = await getSubscription(id);
  assertSubscriptionTransition(sub.status, parsed.data.status);
  const updated = await deps.subscriptions.update(id, {
    status: parsed.data.status,
  });
  await deps.audit.append({
    action: "subscription.status_changed",
    entity: "Subscription",
    entityId: id,
    metadata: { from: sub.status, to: parsed.data.status },
  });
  return updated;
}

export async function listUpcomingBillings(limit = 10) {
  const active = await deps.subscriptions.list({ status: "active" });
  return active
    .filter((s) => s.nextBillingDate)
    .sort(
      (a, b) =>
        (a.nextBillingDate?.getTime() ?? 0) -
        (b.nextBillingDate?.getTime() ?? 0),
    )
    .slice(0, limit);
}
