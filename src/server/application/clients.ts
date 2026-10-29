import { NotFoundError, ValidationError } from "@/server/domain/errors";
import type { ClientRecord } from "@/server/domain/ports/repositories";
import { deps } from "./container";
import { clientCreateSchema, clientUpdateSchema } from "./schemas";

export async function listClients(search?: string): Promise<ClientRecord[]> {
  return deps.clients.list({ search });
}

export async function getClient(id: string): Promise<ClientRecord> {
  const client = await deps.clients.findById(id);
  if (!client) throw new NotFoundError("Client", id);
  return client;
}

export async function createClient(input: unknown): Promise<ClientRecord> {
  const parsed = clientCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  const client = await deps.clients.create({
    ...parsed.data,
    phone: parsed.data.phone ?? null,
    companyName: parsed.data.companyName ?? null,
    billingAddress: parsed.data.billingAddress ?? null,
    billingCity: parsed.data.billingCity ?? null,
    billingPostalCode: parsed.data.billingPostalCode ?? null,
    notes: parsed.data.notes ?? null,
  });
  await deps.audit.append({
    action: "client.created",
    entity: "Client",
    entityId: client.id,
  });
  return client;
}

export async function updateClient(
  id: string,
  input: unknown,
): Promise<ClientRecord> {
  await getClient(id);
  const parsed = clientUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  const client = await deps.clients.update(id, parsed.data);
  await deps.audit.append({
    action: "client.updated",
    entity: "Client",
    entityId: id,
  });
  return client;
}

export async function deleteClient(id: string): Promise<void> {
  await getClient(id);
  await deps.clients.softDelete(id);
  await deps.audit.append({
    action: "client.soft_deleted",
    entity: "Client",
    entityId: id,
  });
}

export async function getClientDetail(id: string) {
  const client = await getClient(id);
  const [quotes, invoices, subscriptions] = await Promise.all([
    deps.quotes.list({ clientId: id }),
    deps.invoices.list({ clientId: id }),
    deps.subscriptions.list({ clientId: id }),
  ]);
  return { client, quotes, invoices, subscriptions };
}
