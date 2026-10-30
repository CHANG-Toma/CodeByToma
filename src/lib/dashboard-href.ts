/** Construit une URL dashboard à partir du slug secret (pur, safe client). */
export function dashboardHref(slug: string, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${slug}/${clean}` : `/${slug}`;
}

export function clientQuoteHref(
  slug: string,
  clientId: string,
  quoteId: string,
): string {
  return dashboardHref(slug, `clients/${clientId}/quotes/${quoteId}`);
}

export function clientInvoiceHref(
  slug: string,
  clientId: string,
  invoiceId: string,
): string {
  return dashboardHref(slug, `clients/${clientId}/invoices/${invoiceId}`);
}

export function clientQuotesListHref(slug: string, clientId: string): string {
  return dashboardHref(slug, `clients/${clientId}/quotes`);
}

export function clientInvoicesListHref(slug: string, clientId: string): string {
  return dashboardHref(slug, `clients/${clientId}/invoices`);
}
