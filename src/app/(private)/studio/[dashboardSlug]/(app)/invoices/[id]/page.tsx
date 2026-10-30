import { redirect } from "next/navigation";
import { clientInvoiceHref } from "@/lib/dashboard-href";
import { getInvoice } from "@/server/application/invoices";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

/** Ancienne URL globale → espace client. */
export default async function InvoiceDetailRedirectPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  const invoice = await getInvoice(id);
  redirect(clientInvoiceHref(dashboardSlug, invoice.clientId, invoice.id));
}
