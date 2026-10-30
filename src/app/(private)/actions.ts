"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import * as clientsApp from "@/server/application/clients";
import * as clientAccessApp from "@/server/application/client-access";
import * as portalApp from "@/server/application/portal";
import * as quotesApp from "@/server/application/quotes";
import * as invoicesApp from "@/server/application/invoices";
import * as paymentsApp from "@/server/application/payments";
import * as subscriptionsApp from "@/server/application/subscriptions";
import * as remindersApp from "@/server/application/reminders";
import * as settingsApp from "@/server/application/settings";
import { getDashboardBasePath } from "@/server/infrastructure/auth/dashboard-path";
import { clientInvoiceHref, dashboardHref } from "@/lib/dashboard-href";
import {
  requireAdmin,
  requireClient,
  signIn,
  signOut,
} from "@/server/infrastructure/auth/session";
import { getClientIpKey } from "@/server/infrastructure/auth/client-ip";
import { DomainError } from "@/server/domain/errors";
import type { ReminderKind } from "@/server/domain/reminder-templates";
import { postLoginPath } from "@/server/domain/roles";

function slug() {
  return getDashboardBasePath();
}

function revalidateDashboard(path = "") {
  revalidatePath(dashboardHref(slug(), path));
}

function revalidatePortal(path = "") {
  revalidatePath(path ? `/espace/${path}` : "/espace");
}

function toActionError(e: unknown): { ok: false; error: string } {
  if (e instanceof DomainError) {
    return { ok: false, error: e.message };
  }
  return { ok: false, error: "Une erreur est survenue" };
}

function rethrowRedirect(e: unknown): never {
  if (isRedirectError(e)) throw e;
  throw e instanceof DomainError
    ? new Error(e.message)
    : new Error("Une erreur est survenue");
}

export async function signInAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const ipKey = await getClientIpKey();
  const result = await signIn(
    {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    },
    ipKey,
  );
  if (!result.ok) return result;
  redirect(postLoginPath(result.role, slug()));
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/");
}

export async function createClientAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const client = await clientsApp.createClient({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      companyName: String(formData.get("companyName") ?? "") || null,
      billingAddress: String(formData.get("billingAddress") ?? "") || null,
      billingCity: String(formData.get("billingCity") ?? "") || null,
      billingPostalCode: String(formData.get("billingPostalCode") ?? "") || null,
      billingCountry: String(formData.get("billingCountry") ?? "FR") || "FR",
      notes: String(formData.get("notes") ?? "") || null,
      consentContract: formData.get("consentContract") === "on",
      consentMarketing: formData.get("consentMarketing") === "on",
    });
    revalidateDashboard("clients");
    return { ok: true, id: client.id };
  } catch (e) {
    return toActionError(e);
  }
}

export async function updateClientAction(
  id: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await clientsApp.updateClient(id, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      companyName: String(formData.get("companyName") ?? "") || null,
      billingAddress: String(formData.get("billingAddress") ?? "") || null,
      billingCity: String(formData.get("billingCity") ?? "") || null,
      billingPostalCode: String(formData.get("billingPostalCode") ?? "") || null,
      billingCountry: String(formData.get("billingCountry") ?? "FR") || "FR",
      notes: String(formData.get("notes") ?? "") || null,
      consentContract: formData.get("consentContract") === "on",
      consentMarketing: formData.get("consentMarketing") === "on",
    });
    revalidateDashboard(`clients/${id}`);
    revalidateDashboard("clients");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function deleteClientAction(id: string) {
  await requireAdmin();
  try {
    await clientsApp.deleteClient(id);
    revalidateDashboard("clients");
    redirect(dashboardHref(slug(), "clients"));
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function createClientAccessAction(
  formData: FormData,
): Promise<{ ok: true; success: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const clientId = String(formData.get("clientId") ?? "");
    await clientAccessApp.createClientPortalAccess({
      clientId,
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      name: String(formData.get("name") ?? "") || null,
    });
    revalidateDashboard(`clients/${clientId}/overview`);
    return {
      ok: true,
      success: "Accès espace client créé. Communiquez le mot de passe de façon sécurisée.",
    };
  } catch (e) {
    return toActionError(e);
  }
}

export async function createQuoteAction(
  formData: FormData,
): Promise<
  { ok: true; id: string; clientId: string } | { ok: false; error: string }
> {
  await requireAdmin();
  try {
    const linesRaw = String(formData.get("linesJson") ?? "[]");
    const lines = JSON.parse(linesRaw) as unknown;
    const quote = await quotesApp.createQuote({
      clientId: String(formData.get("clientId") ?? ""),
      notes: String(formData.get("notes") ?? "") || null,
      validUntil: formData.get("validUntil")
        ? String(formData.get("validUntil"))
        : null,
      lines,
    });
    revalidateDashboard("quotes");
    revalidateDashboard(`clients/${quote.clientId}/quotes`);
    return { ok: true, id: quote.id, clientId: quote.clientId };
  } catch (e) {
    return toActionError(e);
  }
}

export async function sendQuoteAction(id: string) {
  await requireAdmin();
  try {
    await quotesApp.transitionQuote(id, { status: "sent" });
    revalidateDashboard(`quotes/${id}`);
    revalidateDashboard("quotes");
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function acceptQuoteAction(id: string) {
  await requireAdmin();
  try {
    const invoice = await quotesApp.acceptQuoteAndCreateInvoice(id);
    revalidateDashboard(`quotes/${id}`);
    revalidateDashboard("quotes");
    revalidateDashboard("invoices");
    revalidateDashboard(`clients/${invoice.clientId}/quotes`);
    revalidateDashboard(`clients/${invoice.clientId}/invoices`);
    redirect(clientInvoiceHref(slug(), invoice.clientId, invoice.id));
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function rejectQuoteAction(id: string) {
  await requireAdmin();
  try {
    await quotesApp.transitionQuote(id, { status: "rejected" });
    revalidateDashboard(`quotes/${id}`);
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function createInvoiceFromQuoteAction(quoteId: string) {
  await requireAdmin();
  try {
    const invoice = await invoicesApp.createInvoiceFromQuote(quoteId);
    revalidateDashboard("invoices");
    revalidateDashboard(`clients/${invoice.clientId}/invoices`);
    revalidateDashboard(`clients/${invoice.clientId}/quotes`);
    redirect(clientInvoiceHref(slug(), invoice.clientId, invoice.id));
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function issueInvoiceAction(id: string) {
  await requireAdmin();
  try {
    await invoicesApp.transitionInvoice(id, { status: "issued" });
    revalidateDashboard(`invoices/${id}`);
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function cancelInvoiceAction(id: string) {
  await requireAdmin();
  try {
    await invoicesApp.transitionInvoice(id, { status: "cancelled" });
    revalidateDashboard(`invoices/${id}`);
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function createPaymentAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const euros = Number(String(formData.get("amountEuros") ?? "0").replace(",", "."));
    await paymentsApp.createPayment({
      invoiceId: String(formData.get("invoiceId") ?? ""),
      amountCents: Math.round(euros * 100),
      method: String(formData.get("method") ?? "bank_transfer"),
      paidAt: formData.get("paidAt")
        ? String(formData.get("paidAt"))
        : new Date().toISOString(),
      reference: String(formData.get("reference") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    });
    revalidateDashboard("payments");
    revalidateDashboard("invoices");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function createSubscriptionAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const priceEuros = formData.get("priceEuros")
      ? Number(String(formData.get("priceEuros")).replace(",", "."))
      : undefined;
    const sub = await subscriptionsApp.createSubscription({
      clientId: String(formData.get("clientId") ?? ""),
      offerKind: String(formData.get("offerKind") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      priceCents:
        priceEuros !== undefined && !Number.isNaN(priceEuros)
          ? Math.round(priceEuros * 100)
          : undefined,
      notes: String(formData.get("notes") ?? "") || null,
    });
    revalidateDashboard("subscriptions");
    return { ok: true, id: sub.id };
  } catch (e) {
    return toActionError(e);
  }
}

export async function pauseSubscriptionAction(id: string) {
  await requireAdmin();
  try {
    await subscriptionsApp.transitionSubscription(id, { status: "paused" });
    revalidateDashboard("subscriptions");
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function resumeSubscriptionAction(id: string) {
  await requireAdmin();
  try {
    await subscriptionsApp.transitionSubscription(id, { status: "active" });
    revalidateDashboard("subscriptions");
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function cancelSubscriptionAction(id: string) {
  await requireAdmin();
  try {
    await subscriptionsApp.transitionSubscription(id, { status: "cancelled" });
    revalidateDashboard("subscriptions");
  } catch (e) {
    rethrowRedirect(e);
  }
}

/* ——— Espace client ——— */

export async function acceptPortalQuoteAction(id: string) {
  try {
    const session = await requireClient();
    const invoice = await portalApp.acceptPortalQuote(session.clientId, id);
    revalidatePortal("devis");
    revalidatePortal(`devis/${id}`);
    revalidatePortal("factures");
    redirect(`/espace/factures/${invoice.id}`);
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function rejectPortalQuoteAction(id: string) {
  try {
    const session = await requireClient();
    await portalApp.rejectPortalQuote(session.clientId, id);
    revalidatePortal("devis");
    revalidatePortal(`devis/${id}`);
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function updatePortalProfileAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireClient();
  try {
    await portalApp.updatePortalProfile(session.clientId, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      companyName: String(formData.get("companyName") ?? "") || null,
      billingAddress: String(formData.get("billingAddress") ?? "") || null,
      billingCity: String(formData.get("billingCity") ?? "") || null,
      billingPostalCode: String(formData.get("billingPostalCode") ?? "") || null,
      billingCountry: String(formData.get("billingCountry") ?? "FR") || "FR",
      consentContract: formData.get("consentContract") === "on",
      consentMarketing: formData.get("consentMarketing") === "on",
    });
    revalidatePortal("profil");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function markReminderSentAction(input: {
  entity: "quote" | "invoice";
  entityId: string;
  kind: ReminderKind;
  channel?: "mailto" | "log" | "copy";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await remindersApp.markReminderSent({
      entity: input.entity,
      entityId: input.entityId,
      kind: input.kind,
      channel: input.channel ?? "mailto",
    });
    revalidateDashboard();
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function updateAdminProfileAction(formData: FormData) {
  const session = await requireAdmin();
  try {
    await settingsApp.updateAdminProfile(session.sub, {
      name: String(formData.get("name") ?? ""),
    });
    revalidateDashboard("profil");
    revalidateDashboard();
  } catch (e) {
    rethrowRedirect(e);
  }
}

export async function updateAdminFeesAction(formData: FormData) {
  const session = await requireAdmin();
  try {
    await settingsApp.updateAdminFees(session.sub, {
      setupEuros: String(formData.get("setupEuros") ?? ""),
      hostingEuros: String(formData.get("hostingEuros") ?? ""),
      tjmEuros: String(formData.get("tjmEuros") ?? ""),
    });
    revalidateDashboard("profil");
    revalidateDashboard("quotes");
    revalidatePath("/");
  } catch (e) {
    rethrowRedirect(e);
  }
}
