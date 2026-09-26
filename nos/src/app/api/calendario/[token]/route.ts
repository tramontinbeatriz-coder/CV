import { getRegistrationByToken } from "@/lib/registrations";
import { config } from "@/lib/config";

/** Arquivo .ics para adicionar o encontro à agenda (Google, Apple, Outlook). */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const row = await getRegistrationByToken(token);
  if (!row || row.registration.paymentStatus !== "paid") return new Response("não encontrado", { status: 404 });
  const { event } = row;
  const start = `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00`;
  const [h, m] = event.time.split(":").map(Number);
  const endH = String(Math.min(h + 2, 23)).padStart(2, "0");
  const end = `${event.date.replace(/-/g, "")}T${endH}${String(m).padStart(2, "0")}00`;
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nos//encontros//PT",
    "BEGIN:VEVENT",
    `UID:${row.registration.id}@nos`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=America/Sao_Paulo:${start}`,
    `DTEND;TZID=America/Sao_Paulo:${end}`,
    `SUMMARY:${esc(`nós — ${event.title}`)}`,
    `LOCATION:${esc([event.locationName, event.address].filter(Boolean).join(", "))}`,
    `URL:${config.siteUrl}/confirmacao/${token}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nos-${event.slug}.ics"`,
    },
  });
}
