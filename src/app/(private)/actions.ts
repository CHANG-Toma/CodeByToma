"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as clientsApp from "@/server/application/clients";
import * as quotesApp from "@/server/application/quotes";
import * as invoicesApp from "@/server/application/invoices";
import * as paymentsApp from "@/server/application/payments";
import * as subscriptionsApp from "@/server/application/subscriptions";
import {
  getDashboardBasePath,
  dashboardHref,
} from "@/server/infrastructure/auth/dashboard-path";
import {
  requireSession,
  signIn,
  signOut,
} from "@/server/infrastructure/auth/session";
import { DomainError } from "@/server/domain/errors";

function slug() {
  return getDashboardBasePath();
}

function revalidateDashboard(path = "") {
  revalidatePath(dashboardHref(slug(), path));
}

function toActionError(e: unknown): { ok: false; error: string } {
  if (e instanceof DomainError) {
    return { ok: false, error: e.message };
  }
  return { ok: false, error: "Une erreur est survenue" };
}

export async function signInAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const result = await signIn({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!result.ok) return result;
  redirect(dashboardHref(slug()));
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(dashboardHref(slug(), "signin"));
}

export async function createClientAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();
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
  await requireSession();
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
  await requireSession();
  await clientsApp.deleteClient(id);
  revalidateDashboard("clients");
  redirect(dashboardHref(slug(), "clients"));
}

export async function createQuoteAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();
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
    return { ok: true, id: quote.id };
  } catch (e) {
    return toActionError(e);
  }
}

export async function sendQuoteAction(id: string) {
  await requireSession();
  await quotesApp.transitionQuote(id, { status: "sent" });
  revalidateDashboard(`quotes/${id}`);
  revalidateDashboard("quotes");
}

export async function acceptQuoteAction(id: string) {
  await requireSession();
  const invoice = await quotesApp.acceptQuoteAndCreateInvoice(id);
  revalidateDashboard(`quotes/${id}`);
  revalidateDashboard("quotes");
  revalidateDashboard("invoices");
  redirect(dashboardHref(slug(), `invoices/${invoice.id}`));
}

export async function rejectQuoteAction(id: string) {
  await requireSession();
  await quotesApp.transitionQuote(id, { status: "rejected" });
  revalidateDashboard(`quotes/${id}`);
}

export async function createInvoiceAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();
  try {
    const lines = JSON.parse(String(formData.get("linesJson") ?? "[]")) as unknown;
    const invoice = await invoicesApp.createInvoice({
      clientId: String(formData.get("clientId") ?? ""),
      notes: String(formData.get("notes") ?? "") || null,
      lines,
      issueNow: formData.get("issueNow") !== "false",
    });
    revalidateDashboard("invoices");
    return { ok: true, id: invoice.id };
  } catch (e) {
    return toActionError(e);
  }
}

export async function issueInvoiceAction(id: string) {
  await requireSession();
  await invoicesApp.transitionInvoice(id, { status: "issued" });
  revalidateDashboard(`invoices/${id}`);
}

export async function cancelInvoiceAction(id: string) {
  await requireSession();
  await invoicesApp.transitionInvoice(id, { status: "cancelled" });
  revalidateDashboard(`invoices/${id}`);
}

export async function createPaymentAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireSession();
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
  await requireSession();
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
  await requireSession();
  await subscriptionsApp.transitionSubscription(id, { status: "paused" });
  revalidateDashboard("subscriptions");
}

export async function resumeSubscriptionAction(id: string) {
  await requireSession();
  await subscriptionsApp.transitionSubscription(id, { status: "active" });
  revalidateDashboard("subscriptions");
}

export async function cancelSubscriptionAction(id: string) {
  await requireSession();
  await subscriptionsApp.transitionSubscription(id, { status: "cancelled" });
  revalidateDashboard("subscriptions");
}
