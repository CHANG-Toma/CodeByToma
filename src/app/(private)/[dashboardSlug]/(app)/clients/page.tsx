import Link from "next/link";
import { listClients } from "@/server/application/clients";
import { dashboardHref } from "@/server/infrastructure/auth/dashboard-path";
import {
  EmptyState,
  PageHeader,
  Panel,
  PrimaryButton,
} from "@/components/dashboard/ui";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function ClientsPage({ params, searchParams }: Props) {
  const { dashboardSlug } = await params;
  const { q } = await searchParams;
  const clients = await listClients(q);

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Contacts et fiches de facturation."
        actions={
          <Link href={dashboardHref(dashboardSlug, "clients/new")}>
            <PrimaryButton type="button">Nouveau client</PrimaryButton>
          </Link>
        }
      />

      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher nom, e-mail, société…"
          className="w-full max-w-md rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white outline-none ring-sky-500/40 placeholder:text-[#5c6b7d] focus:ring-2"
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState
          title="Aucun client"
          description="Créez votre premier client pour démarrer un devis."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[#8fa0b5]">
              <tr>
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Société</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Ville</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <Link
                      href={dashboardHref(dashboardSlug, `clients/${c.id}`)}
                      className="font-medium text-white hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[#c5d0de]">
                    {c.companyName ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[#c5d0de]">{c.email}</td>
                  <td className="px-5 py-3 text-[#c5d0de]">
                    {c.billingCity ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
