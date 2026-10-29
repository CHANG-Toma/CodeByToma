import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/server/domain/errors";
import { validatePasswordPolicy } from "@/server/domain/password-policy";
import { hashPassword } from "@/server/infrastructure/auth/session";
import { deps } from "./container";
import { clientAccessCreateSchema } from "./schemas";

export async function getClientPortalAccess(clientId: string) {
  return deps.users.findByClientId(clientId);
}

export async function createClientPortalAccess(input: unknown) {
  const parsed = clientAccessCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Données invalides",
    );
  }

  const policy = validatePasswordPolicy(parsed.data.password);
  if (!policy.ok) {
    throw new ValidationError(policy.message);
  }

  const client = await deps.clients.findById(parsed.data.clientId);
  if (!client || client.deletedAt) {
    throw new NotFoundError("Client", parsed.data.clientId);
  }

  const existingForClient = await deps.users.findByClientId(parsed.data.clientId);
  if (existingForClient) {
    throw new ConflictError("Ce client a déjà un accès à l'espace client.");
  }

  const email = parsed.data.email.toLowerCase();
  const existingEmail = await deps.users.findByEmail(email);
  if (existingEmail) {
    throw new ConflictError("Cette adresse e-mail est déjà utilisée.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await deps.users.createClientAccess({
    email,
    passwordHash,
    name: parsed.data.name ?? client.name,
    clientId: parsed.data.clientId,
  });

  await deps.audit.append({
    action: "client_access.created",
    entity: "User",
    entityId: user.id,
    metadata: { clientId: parsed.data.clientId },
  });

  return user;
}
