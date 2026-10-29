import { redirect } from "next/navigation";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";

type Props = {
  params: Promise<{ dashboardSlug: string; id: string }>;
};

/** Entrée fiche client → onglet Devis par défaut. */
export default async function ClientIndexPage({ params }: Props) {
  const { dashboardSlug, id } = await params;
  redirect(dashboardHref(dashboardSlug, `clients/${id}/quotes`));
}
