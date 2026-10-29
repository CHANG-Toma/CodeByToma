import { notFound } from "next/navigation";
import { deleteClientAction } from "@/app/(private)/actions";
import { ClientSubNav } from "@/components/dashboard/ClientSubNav";
import {
  PageHeader,
  PrimaryLink,
  SecondaryButton,
} from "@/components/dashboard/ui";
import { getClientDetail } from "@/server/application/clients";
import { deps } from "@/server/application/container";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  children: React.ReactNode;
  params: Promise<{ dashboardSlug: string; id: string }>;
};

export default async function ClientLayout({ children, params }: Props) {
  const { dashboardSlug, id } = await params;

  let detail;
  try {
    detail = await getClientDetail(id);
  } catch {
    notFound();
  }

  const { client, quotes, invoices } = detail;
  const payments = await deps.payments.list();
  const invoiceIds = new Set(invoices.map((i) => i.id));
  const clientPayments = payments.filter((p) => invoiceIds.has(p.invoiceId));

  async function remove() {
    "use server";
    await deleteClientAction(id);
  }

  return (
    <div>
      <PageHeader
        title={client.companyName || client.name}
        description={
          [client.name !== client.companyName ? client.name : null, client.email]
            .filter(Boolean)
            .join(" · ")
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <PrimaryLink
              href={dashboardHref(dashboardSlug, `quotes/new?clientId=${id}`)}
            >
              Nouveau devis
            </PrimaryLink>
            <form action={remove}>
              <SecondaryButton>Archiver</SecondaryButton>
            </form>
          </div>
        }
      />

      <ClientSubNav
        slug={dashboardSlug}
        clientId={id}
        counts={{
          quotes: quotes.length,
          invoices: invoices.length,
          payments: clientPayments.length,
        }}
      />

      {children}
    </div>
  );
}
