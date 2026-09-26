import type { Metadata } from "next";
import Link from "next/link";
import { Knot } from "@/components/brand/Logo";
import { EventCta, Photo, SampleBadge, SpotsLine, StatusTag } from "@/components/site/ui";
import { getContent, instagramUrl } from "@/lib/content";
import { getUpcomingEvents } from "@/lib/events";
import { formatDayMonth, formatPrice, formatShortDate, formatTime, weekdayOf } from "@/lib/format";

export const metadata: Metadata = {
  title: "próximos encontros",
  description: "a agenda de encontros presenciais da nós em porto alegre — veja datas, vagas e garanta seu lugar.",
};

export default async function EventsPage() {
  const [events, c] = await Promise.all([getUpcomingEvents(), getContent()]);

  return (
    <>
      <section className="bg-green pb-16 pt-32 text-cream md:pb-24 md:pt-44">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <p className="label dash dash-lime rise">agenda</p>
          <h1 className="display rise mt-6 text-[17vw] md:text-[10rem]" style={{ ["--delay" as string]: "100ms" }}>
            próximos
            <br />
            <span className="text-lime">encontros</span>
          </h1>
          <p className="italic-serif rise mt-8 max-w-xl text-2xl" style={{ ["--delay" as string]: "250ms" }}>
            escolha um encontro, garanta seu lugar e venha como estiver. sozinha também vale.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-28">
        {events.length === 0 ? (
          <div className="flex flex-col items-start gap-6 py-10">
            <Knot className="w-16 text-pink wobble" />
            <p className="italic-serif text-3xl text-green">os próximos encontros estão sendo preparados.</p>
            <a href={instagramUrl(c.instagram_handle)} className="btn btn-green" target="_blank" rel="noreferrer">
              acompanhe no instagram
            </a>
          </div>
        ) : (
          <ol className="divide-y divide-line border-y border-line">
            {events.map((event) => (
              <li key={event.id} className="reveal py-10 md:py-14">
                <article className="grid gap-8 md:grid-cols-12 md:items-center md:gap-10">
                  <div className="md:col-span-2">
                    <p className="display text-6xl text-pink md:text-7xl">{formatShortDate(event.date)}</p>
                    <p className="label mt-2 text-muted">
                      {weekdayOf(event.date)} · {formatTime(event.time)}
                    </p>
                  </div>
                  <Link href={`/eventos/${event.slug}`} className="photo-zoom relative block md:col-span-4">
                    <Photo src={event.coverImage} alt={event.coverAlt ?? event.title} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/3]" />
                    <span className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <StatusTag status={event.effective} />
                      <SampleBadge show={event.isSample} />
                    </span>
                  </Link>
                  <div className="md:col-span-6">
                    <h2 className="display text-4xl text-green md:text-5xl">
                      <Link href={`/eventos/${event.slug}`} className="hover:opacity-70">
                        {event.title}
                      </Link>
                    </h2>
                    {event.summary && <p className="mt-3 max-w-lg text-ink/80">{event.summary}</p>}
                    <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <dt className="label text-muted">data</dt>
                        <dd>{formatDayMonth(event.date)}</dd>
                      </div>
                      <div>
                        <dt className="label text-muted">local</dt>
                        <dd>{event.locationName || "a definir"}</dd>
                      </div>
                      <div>
                        <dt className="label text-muted">valor</dt>
                        <dd>{formatPrice(event.priceCents)}</dd>
                      </div>
                      <div>
                        <dt className="label text-muted">vagas</dt>
                        <dd>
                          <SpotsLine event={event} />
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-7 flex flex-wrap items-center gap-5">
                      <EventCta event={event} label="inscreva-se" />
                      <Link href={`/eventos/${event.slug}`} className="label link">
                        ver detalhes
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
