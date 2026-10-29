export const USER_ROLES = ["admin", "client"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function postLoginPath(role: UserRole, dashboardSlug: string): string {
  if (role === "client") return "/espace";
  const slug = dashboardSlug.replace(/^\/+|\/+$/g, "");
  return `/${slug}`;
}
