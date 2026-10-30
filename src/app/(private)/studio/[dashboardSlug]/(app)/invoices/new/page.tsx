import { redirect } from "next/navigation";
import { dashboardHref } from "@/lib/dashboard-href";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
};

/** Les factures se créent uniquement depuis un devis accepté. */
export default async function NewInvoiceRedirectPage({ params }: Props) {
  const { dashboardSlug } = await params;
  redirect(dashboardHref(dashboardSlug, "quotes"));
}
