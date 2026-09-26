import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { listRegistrations, listWaitlist, toCsv } from "@/lib/admin-queries";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PAYMENT_LABEL, paymentDisplay } from "@/components/admin/ui";

/** CSV de inscrições (ou lista de espera com ?tipo=espera). Protegido por login. */
export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  const p = req.nextUrl.searchParams;
  const eventId = p.get("evento") || undefined;
  const stamp = new Date().toISOString().slice(0, 10);

  if (p.get("tipo") === "espera") {
    const rows = await listWaitlist(eventId);
    const csv = toCsv([
      ["nome", "e-mail", "telefone", "instagram", "encontro", "entrou em"],
      ...rows.map(({ w, eventTitle }) => [w.name, w.email, w.phone, w.instagram, eventTitle, formatDateTime(w.createdAt)]),
    ]);
    return new Response(csv, { headers: csvHeaders(`lista-de-espera-${stamp}.csv`) });
  }

  const rows = await listRegistrations({ eventId, status: p.get("status") || undefined, q: p.get("q") || undefined });
  const csv = toCsv([
    ["nome", "e-mail", "telefone", "instagram", "cidade", "como conheceu", "encontro", "data do encontro", "status do pagamento", "valor", "data da inscrição", "pago em", "provedor", "referência"],
    ...rows.map(({ r, eventTitle, eventDate }) => [
      r.name,
      r.email,
      r.phone,
      r.instagram,
      r.city,
      r.discoverySource,
      eventTitle,
      eventDate,
      PAYMENT_LABEL[paymentDisplay(r)],
      formatPrice(r.amountCents),
      formatDateTime(r.createdAt),
      r.paidAt ? formatDateTime(r.paidAt) : "",
      r.paymentProvider,
      r.providerReference,
    ]),
  ]);
  return new Response(csv, { headers: csvHeaders(`inscricoes-${stamp}.csv`) });
}

function csvHeaders(filename: string) {
  return { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` };
}
