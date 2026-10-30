import type { RowAction } from "@/components/dashboard/RowActions";
import {
  clientInvoiceHref,
  clientQuoteHref,
  dashboardHref,
} from "@/lib/dashboard-href";
import type {
  InvoiceStatus,
  QuoteStatus,
} from "@/server/domain/status-transitions";

export function clientListActions(input: {
  slug: string;
  clientId: string;
}): RowAction[] {
  return [
    {
      kind: "link",
      label: "Voir profil",
      href: dashboardHref(input.slug, `clients/${input.clientId}/quotes`),
    },
    {
      kind: "link",
      label: "Créer devis",
      href: dashboardHref(
        input.slug,
        `quotes/new?clientId=${input.clientId}`,
      ),
    },
  ];
}

export function quoteListActions(input: {
  slug: string;
  clientId: string;
  quoteId: string;
  status: QuoteStatus;
  includeClientLink?: boolean;
  sendAction?: () => void | Promise<void>;
  acceptAction?: () => void | Promise<void>;
  rejectAction?: () => void | Promise<void>;
}): RowAction[] {
  const actions: RowAction[] = [
    {
      kind: "link",
      label: "Voir",
      href: clientQuoteHref(input.slug, input.clientId, input.quoteId),
    },
  ];

  if (input.includeClientLink !== false) {
    actions.push({
      kind: "link",
      label: "Voir client",
      href: dashboardHref(input.slug, `clients/${input.clientId}/quotes`),
    });
  }

  if (input.status === "draft" && input.sendAction) {
    actions.push({
      kind: "button",
      label: "Envoyer",
      formAction: input.sendAction,
    });
  }

  if (input.status === "sent" || input.status === "expired") {
    actions.push({
      kind: "link",
      label: "Relancer",
      href: dashboardHref(input.slug, `reminders/quote/${input.quoteId}`),
    });
  }

  if (
    (input.status === "sent" || input.status === "accepted") &&
    input.acceptAction
  ) {
    actions.push({
      kind: "button",
      label: "Accepter",
      formAction: input.acceptAction,
    });
  }

  if (
    (input.status === "draft" || input.status === "sent") &&
    input.rejectAction
  ) {
    actions.push({
      kind: "button",
      label: "Refuser",
      formAction: input.rejectAction,
      tone: "danger",
    });
  }

  return actions;
}

export function invoiceListActions(input: {
  slug: string;
  clientId: string;
  invoiceId: string;
  status: InvoiceStatus;
  remainingCents?: number;
  includeClientLink?: boolean;
  issueAction?: () => void | Promise<void>;
  cancelAction?: () => void | Promise<void>;
}): RowAction[] {
  const actions: RowAction[] = [
    {
      kind: "link",
      label: "Voir",
      href: clientInvoiceHref(input.slug, input.clientId, input.invoiceId),
    },
  ];

  if (input.includeClientLink !== false) {
    actions.push({
      kind: "link",
      label: "Voir client",
      href: dashboardHref(input.slug, `clients/${input.clientId}/invoices`),
    });
  }

  actions.push({
    kind: "link",
    label: "Télécharger PDF",
    href: dashboardHref(input.slug, `invoices/${input.invoiceId}/pdf`),
  });

  if (input.status === "draft" && input.issueAction) {
    actions.push({
      kind: "button",
      label: "Émettre",
      formAction: input.issueAction,
    });
  }

  if (
    (input.status === "issued" ||
      input.status === "partially_paid" ||
      input.status === "overdue") &&
    (input.remainingCents ?? 1) > 0
  ) {
    actions.push({
      kind: "link",
      label: "Relancer",
      href: dashboardHref(
        input.slug,
        `reminders/invoice/${input.invoiceId}`,
      ),
    });
    actions.push({
      kind: "link",
      label: "Enregistrer un paiement",
      href: clientInvoiceHref(input.slug, input.clientId, input.invoiceId),
    });
  }

  if (
    input.status !== "paid" &&
    input.status !== "cancelled" &&
    input.cancelAction
  ) {
    actions.push({
      kind: "button",
      label: "Annuler",
      formAction: input.cancelAction,
      tone: "danger",
    });
  }

  return actions;
}

export function paymentListActions(input: {
  slug: string;
  clientId: string;
  invoiceId: string;
}): RowAction[] {
  return [
    {
      kind: "link",
      label: "Voir facture",
      href: clientInvoiceHref(input.slug, input.clientId, input.invoiceId),
    },
    {
      kind: "link",
      label: "Voir client",
      href: dashboardHref(input.slug, `clients/${input.clientId}/payments`),
    },
  ];
}
