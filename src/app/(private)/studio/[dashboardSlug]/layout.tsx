import type { Metadata } from "next";
import {
  assertValidDashboardSlug,
  getDashboardBasePath,
} from "@/server/infrastructure/auth/dashboard-path";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  title: "Studio",
};

/** Seul le slug secret est valide — évite d’absorber d’autres segments. */
export const dynamicParams = false;

export function generateStaticParams() {
  const slug = getDashboardBasePath();
  return slug ? [{ dashboardSlug: slug }] : [];
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ dashboardSlug: string }>;
};

export default async function DashboardSlugLayout({ children, params }: Props) {
  const { dashboardSlug } = await params;
  assertValidDashboardSlug(dashboardSlug);
  return children;
}
