import { getEventBySlug } from "@/lib/events";
import { formatLongDate, formatTime } from "@/lib/format";
import { renderOg } from "@/lib/og/render";

/** Imagem de compartilhamento de cada encontro (aparece no preview do WhatsApp). */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const event = await getEventBySlug(slug);
  if (!event) return new Response("não encontrado", { status: 404 });
  return renderOg({
    kicker: `${formatLongDate(event.date)} · ${formatTime(event.time)}`,
    title: event.title,
    subtitle: event.locationName ?? undefined,
  });
}
