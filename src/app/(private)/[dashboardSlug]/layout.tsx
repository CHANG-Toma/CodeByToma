import type { Metadata } from "next";
import { assertValidDashboardSlug } from "@/server/infrastructure/auth/dashboard-path";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  title: "Studio",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ dashboardSlug: string }>;
};

export default async function DashboardSlugLayout({ children, params }: Props) {
  const { dashboardSlug } = await params;
  assertValidDashboardSlug(dashboardSlug);
  return children;
}
