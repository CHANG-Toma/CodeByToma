import { NextResponse } from "next/server";
import { getClient } from "@/server/application/clients";
import { getPortalInvoice } from "@/server/application/portal";
import { DomainError } from "@/server/domain/errors";
import { requireClient } from "@/server/infrastructure/auth/session";
import { generateInvoicePdf } from "@/server/infrastructure/pdf/invoice-pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await requireClient();
    const invoice = await getPortalInvoice(session.clientId, id);
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
    if (e instanceof DomainError && e.code === "FORBIDDEN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (e instanceof DomainError && e.code === "NOT_FOUND") {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur PDF" }, { status: 500 });
  }
}
