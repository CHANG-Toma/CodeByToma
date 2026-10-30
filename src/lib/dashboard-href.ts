/** Construit une URL dashboard à partir du slug secret (pur, safe client). */
export function dashboardHref(slug: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${slug}/${clean}` : `/${slug}`;
}
