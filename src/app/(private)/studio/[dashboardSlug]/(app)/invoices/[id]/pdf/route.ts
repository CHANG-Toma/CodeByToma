import { NextResponse } from "next/server";
import { getClient } from "@/server/application/clients";
import { getInvoice } from "@/server/application/invoices";
import { assertValidDashboardSlug } from "@/server/infrastructure/auth/dashboard-path";
import { requireAdmin } from "@/server/infrastructure/auth/session";
import { generateInvoicePdf } from "@/server/infrastructure/pdf/invoice-pdf";
import { DomainError } from "@/server/domain/errors";

type Params = { params: Promise<{ dashboardSlug: string; id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { dashboardSlug, id } = await params;
    assertValidDashboardSlug(dashboardSlug);
    await requireAdmin();

    const invoice = await getInvoice(id);
    const client = await getClient(invoice.clientId);
    const pdf = await generateInvoicePdf(invoice, client);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof DomainError && e.code === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (e instanceof DomainError && e.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur PDF" }, { status: 500 });
  }
}
