import PDFDocument from "pdfkit";
import { formatEur } from "@/server/domain/money";
import type { ClientRecord, InvoiceRecord } from "@/server/domain/ports/repositories";

export type InvoicePdfIssuer = {
  name: string;
  address: string;
  siret?: string;
  email?: string;
  vatNotApplicable: boolean;
};

function getIssuer(): InvoicePdfIssuer {
  return {
    name: process.env.INVOICE_ISSUER_NAME ?? "CodeByToma",
    address: process.env.INVOICE_ISSUER_ADDRESS ?? "France",
    siret: process.env.INVOICE_ISSUER_SIRET || undefined,
    email: process.env.INVOICE_ISSUER_EMAIL || undefined,
    vatNotApplicable: process.env.INVOICE_VAT_NOT_APPLICABLE !== "false",
  };
}

export async function generateInvoicePdf(
  invoice: InvoiceRecord,
  client: ClientRecord,
): Promise<Buffer> {
  const issuer = getIssuer();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(issuer.name, { continued: false });
    doc.fontSize(10).fillColor("#444").text(issuer.address);
    if (issuer.siret) doc.text(`SIRET : ${issuer.siret}`);
    if (issuer.email) doc.text(issuer.email);
    doc.moveDown();

    doc.fillColor("#000").fontSize(16).text(`Facture ${invoice.number}`);
    doc.fontSize(10).fillColor("#444");
    if (invoice.issuedAt) {
      doc.text(
        `Date d'émission : ${invoice.issuedAt.toLocaleDateString("fr-FR")}`,
      );
    }
    if (invoice.dueAt) {
      doc.text(`Échéance : ${invoice.dueAt.toLocaleDateString("fr-FR")}`);
    }
    doc.moveDown();

    doc.fillColor("#000").fontSize(12).text("Facturé à");
    doc.fontSize(10).fillColor("#444");
    doc.text(client.companyName || client.name);
    if (client.companyName) doc.text(client.name);
    if (client.billingAddress) doc.text(client.billingAddress);
    const cityLine = [client.billingPostalCode, client.billingCity]
      .filter(Boolean)
      .join(" ");
    if (cityLine) doc.text(cityLine);
    doc.text(client.email);
    doc.moveDown();

    const tableTop = doc.y;
    doc.fillColor("#000").fontSize(10);
    doc.text("Désignation", 50, tableTop, { width: 240 });
    doc.text("Qté", 300, tableTop, { width: 40 });
    doc.text("P.U. HT", 350, tableTop, { width: 80 });
    doc.text("Total HT", 450, tableTop, { width: 90 });
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke("#ccc");

    let y = tableTop + 25;
    for (const line of invoice.lines) {
      const ht = Math.round(line.quantity * line.unitPriceHtCents);
      doc.text(line.label, 50, y, { width: 240 });
      doc.text(String(line.quantity), 300, y, { width: 40 });
      doc.text(formatEur(line.unitPriceHtCents), 350, y, { width: 80 });
      doc.text(formatEur(ht), 450, y, { width: 90 });
      y += 20;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    doc.y = y + 10;
    doc.moveDown();
    doc.fontSize(11).fillColor("#000");
    doc.text(`Sous-total HT : ${formatEur(invoice.subtotalCents)}`, {
      align: "right",
    });
    doc.text(`TVA : ${formatEur(invoice.taxCents)}`, { align: "right" });
    doc.fontSize(12).text(`Total TTC : ${formatEur(invoice.totalCents)}`, {
      align: "right",
    });
    doc.fontSize(10).text(`Déjà payé : ${formatEur(invoice.paidCents)}`, {
      align: "right",
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#666");
    if (issuer.vatNotApplicable) {
      doc.text(
        "TVA non applicable, article 293 B du CGI (franchise en base de TVA).",
      );
    }
    doc.text(
      "En cas de retard de paiement, des pénalités pourront être appliquées conformément à la réglementation en vigueur. Pas d'escompte pour paiement anticipé.",
    );
    doc.moveDown();
    doc.text(`Statut : ${invoice.status}`);

    doc.end();
  });
}
