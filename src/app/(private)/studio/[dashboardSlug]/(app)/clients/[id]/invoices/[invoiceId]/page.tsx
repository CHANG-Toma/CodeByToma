import { notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/dashboard/InvoiceDetail";
import { getClient } from "@/server/application/clients";
import { getInvoice } from "@/server/application/invoices";
import { listPayments } from "@/server/application/payments";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string; invoiceId: string }>;
};

export default async function ClientInvoiceDetailPage({ params }: Props) {
  const { dashboardSlug, id, invoiceId } = await params;
  const invoice = await getInvoice(invoiceId);
  if (invoice.clientId !== id) notFound();

  const [client, payments] = await Promise.all([
    getClient(id),
    listPayments(invoiceId),
  ]);

  return (
    <InvoiceDetail
      invoice={invoice}
      client={client}
      payments={payments}
      dashboardSlug={dashboardSlug}
    />
  );
}
