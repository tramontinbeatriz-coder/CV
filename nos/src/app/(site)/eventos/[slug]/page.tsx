import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Knot } from "@/components/brand/Logo";
import { Lightbox } from "@/components/site/Lightbox";
import { RegistrationBlock } from "@/components/site/RegistrationBlock";
import { EventCta, Photo, SampleBadge, SpotsLine, StatusTag } from "@/components/site/ui";
import { EventFacts } from "@/components/site/EventFacts";
import { getSession } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getEventBySlug, getEventPhotos, type EventView } from "@/lib/events";
import { formatDayMonth, formatLongDate, formatPrice, formatTime, lines, paragraphs, weekdayOf } from "@/lib/format";
import { canRegister } from "@/lib/spots";
import { config } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const session = await getSession();
  return getEventBySlug(slug, { includeDrafts: !!session });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await load(slug);
  if (!event) return {};
  const description = event.tagline ?? event.summary ?? `${formatLongDate(event.date)}, ${formatTime(event.time)} · ${event.locationName ?? "porto alegre"}`;
  const images = [{ url: `/eventos/${event.slug}/og`, width: 1200, height: 630, alt: event.title }];
  return {
    title: event.title,
    description,
    alternates: { canonical: `/eventos/${event.slug}` },
    openGraph: { title: `${event.title} — nós`, description, images, type: "article" },
    robots: event.published ? undefined : { index: false },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await load(slug);
  if (!event) notFound();
  const [c, gallery] = await Promise.all([getContent(), getEventPhotos(event.id)]);
  const included = lines(event.included);
  const important = lines(event.importantInfo);

  return (
    <>
      {!event.published && (
        <div className="fixed inset-x-0 top-16 z-40 bg-pink py-2 text-center text-sm text-green md:top-20">
          rascunho — só você (logada no painel) está vendo esta página.{" "}
          <Link className="link" href={`/admin/eventos/${event.id}`}>editar</Link>
        </div>
      )}

      <article>
        {/* Abertura */}
        <header className="mx-auto max-w-[1400px] px-5 pb-10 pt-32 md:px-10 md:pb-14 md:pt-44">
          <div className="rise flex flex-wrap items-center gap-3">
            <Link href="/eventos" className="label link text-muted">encontros</Link>
            <span className="label text-muted">/</span>
            <StatusTag status={event.effective} />
            <SampleBadge show={event.isSample} />
          </div>
          <p className="label dash dash-pink rise mt-10 text-green" style={{ ["--delay" as string]: "80ms" }}>
            {weekdayOf(event.date)} · {formatDayMonth(event.date)} · {formatTime(event.time)}
          </p>
          <h1 className="display rise mt-5 max-w-5xl text-[15vw] text-green md:text-[7.5rem]" style={{ ["--delay" as string]: "150ms" }}>
            {event.title}
          </h1>
          {event.tagline && (
            <p className="italic-serif rise mt-8 max-w-2xl text-2xl leading-snug md:text-4xl" style={{ ["--delay" as string]: "260ms" }}>
              “{event.tagline}”
            </p>
          )}
        </header>

        <div className="rise relative mx-auto max-w-[1400px] px-0 md:px-10" style={{ ["--delay" as string]: "300ms" }}>
          <Photo src={event.coverImage} alt={event.coverAlt ?? event.title} sizes="(min-width: 1400px) 1320px, 100vw" priority className="aspect-[4/5] md:aspect-[21/9]" />
          <Knot className="absolute -bottom-8 right-8 w-20 text-pink wobble md:right-16 md:w-28" />
        </div>

        {/* Conteúdo + ficha */}
        <div className="mx-auto grid max-w-[1400px] gap-16 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed">
              {paragraphs(event.description).map((p, i) => (
                <p key={i} className={i === 0 ? "text-xl md:text-2xl" : ""}>
                  {p}
                </p>
              ))}
            </div>

            {included.length > 0 && <InfoList title="o que está incluso" items={included} />}
            {important.length > 0 && <InfoList title="informações importantes" items={important} />}

            <div className="mt-14 border-t border-line pt-8 text-sm text-muted">
              <p className="label mb-3">cancelamento</p>
              <p className="whitespace-pre-line">{c.cancellation_text}</p>
            </div>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-28">
              <EventFacts event={event} />
              <div className="mt-8 hidden md:block">
                {canRegister(event.effective) ? (
                  <a href="#inscricao" className="btn btn-green w-full py-5">quero participar →</a>
                ) : (
                  <EventCta event={event} className="btn btn-green w-full py-5" />
                )}
              </div>
            </div>
          </aside>
        </div>

        {gallery.length > 0 && (
          <section className="mx-auto max-w-[1400px] px-5 pb-20 md:px-10">
            <p className="label dash dash-pink mb-8 text-green">fotos</p>
            <Lightbox photos={gallery.map((p) => ({ id: p.id, url: p.url, alt: p.alt ?? event.title, width: p.width, height: p.height }))} />
          </section>
        )}

        {/* Inscrição */}
        <section id="inscricao" className="bg-mist py-20 md:py-32">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-12 md:px-10">
            <div className="md:col-span-4">
              <p className="label dash dash-pink text-green">inscrição</p>
              <h2 className="display mt-5 text-5xl text-green md:text-6xl">
                {event.effective === "sold_out" ? "lista de espera" : "garanta seu lugar"}
              </h2>
              <p className="script mt-6 -rotate-3 text-5xl text-pink">até lá!</p>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <RegistrationBlock event={event} termsText={c.terms_text} />
            </div>
          </div>
        </section>
      </article>

      {/* CTA fixo no celular */}
      {event.effective !== "closed" && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-cream/95 px-5 py-3 backdrop-blur md:hidden">
          <div className="text-sm leading-tight">
            <p className="font-semibold text-green">{formatPrice(event.priceCents)}</p>
            <p className="text-muted"><SpotsLine event={event} /></p>
          </div>
          <a href="#inscricao" className="btn btn-green">
            {event.effective === "sold_out" ? "lista de espera" : "quero participar"}
          </a>
        </div>
      )}

      {event.effective !== "closed" && <div className="h-20 md:hidden" />}
      <EventJsonLd event={event} />
    </>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-14">
      <p className="label mb-5 text-green">{title}</p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-4 border-b border-line pb-3">
            <Knot className="mt-1.5 w-4 shrink-0 text-pink" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventJsonLd({ event }: { event: EventView }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary ?? event.tagline ?? undefined,
    startDate: `${event.date}T${event.time}:00-03:00`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.coverImage ? [`${config.siteUrl}${event.coverImage.startsWith("/") ? event.coverImage : ""}`] : undefined,
    location: {
      "@type": "Place",
      name: event.locationName ?? "Porto Alegre",
      address: { "@type": "PostalAddress", streetAddress: event.address ?? undefined, addressLocality: event.city ?? "Porto Alegre", addressCountry: "BR" },
    },
    offers: {
      "@type": "Offer",
      price: (event.priceCents / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: canRegister(event.effective) ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `${config.siteUrl}/eventos/${event.slug}`,
    },
    organizer: { "@type": "Organization", name: "nós", url: config.siteUrl },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
