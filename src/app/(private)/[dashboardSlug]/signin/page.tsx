import { redirect } from "next/navigation";
import { SignInForm } from "@/components/dashboard/SignInForm";
import {
  assertValidDashboardSlug,
  dashboardHref,
} from "@/server/infrastructure/auth/dashboard-path";
import { getSession } from "@/server/infrastructure/auth/session";

type Props = { params: Promise<{ dashboardSlug: string }> };

export default async function SignInPage({ params }: Props) {
  const { dashboardSlug } = await params;
  assertValidDashboardSlug(dashboardSlug);

  const session = await getSession();
  if (session) {
    redirect(dashboardHref(dashboardSlug));
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0e141c] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,90,135,0.22),_transparent_60%)]" />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#121a24]/90 p-8 shadow-2xl shadow-black/40">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8fa0b5]">
          CodeByToma
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Connexion</h1>
        <p className="mt-2 text-sm text-[#8fa0b5]">
          Accès privé — activité solo.
        </p>
        <div className="mt-8">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
