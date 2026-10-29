import Link from "next/link";
import { Knot, Lockup, Logo } from "@/components/brand/Logo";
import { EventCalendar } from "@/components/site/EventCalendar";
import { Marquee, Photo, RotatingBadge, SectionHeading } from "@/components/site/ui";
import { InstagramSection } from "@/components/site/InstagramSection";
import { PhotoCarousel } from "@/components/site/PhotoCarousel";
import { getContent } from "@/lib/content";
import { getUpcomingEvents, toCalendarEvent } from "@/lib/events";
import { todayISO } from "@/lib/format";
import { getFeaturedPhotos } from "@/lib/gallery";
import { DEFAULT_GALLERY_PHOTOS } from "@/lib/default-photos";

export default async function HomePage() {
  const [c, events, featured] = await Promise.all([getContent(), getUpcomingEvents(), getFeaturedPhotos(24)]);
  const calendarEvents = events.map(toCalendarEvent);
  // sem fotos em destaque no painel, mostra as fotos dos encontros que já vêm no site
  const galleryPhotos = featured.length
    ? featured.map((p) => ({ id: p.id, url: p.url, alt: p.alt ?? p.eventTitle }))
    : DEFAULT_GALLERY_PHOTOS;
  const words = c.marquee_words.split(",").map((w) => w.trim()).filter(Boolean);

  return (
    <>
      {/* HERO ------------------------------------------------------------ */}
      <section className="relative flex flex-col overflow-hidden bg-green text-cream">
        <div className="absolute inset-0">
          {c.hero_video ? (
            <video className="h-full w-full object-cover" src={c.hero_video} autoPlay muted loop playsInline poster={c.hero_image} />
          ) : (
            <Photo src={c.hero_image} alt="" sizes="100vw" priority className="h-full w-full" />
          )}
          {/* duotone: foto tingida com o verde da marca */}
          <div className="absolute inset-0 bg-green mix-blend-multiply opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-green via-green/30 to-green/10" />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 pb-10 pt-24 md:px-10 md:pb-14 md:pt-28">
          <p className="label rise max-w-xs text-cream/90 md:max-w-none">{c.hero_kicker}</p>

          <div className="mt-6 grid items-end gap-10 md:mt-9 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="rise text-[34vw] leading-none md:text-[19vw] lg:text-[15.5rem]" style={{ ["--delay" as string]: "120ms" }}>
                <Lockup entre className="text-cream" />
                <span className="sr-only">nós</span>
              </h1>
            </div>
            <div className="md:col-span-4 md:pb-8">
              <HeroTagline text={c.hero_title} />
              <div className="rise mt-8 flex flex-wrap items-center gap-6" style={{ ["--delay" as string]: "450ms" }}>
                <Link href="#encontros" className="btn btn-lime">
                  {c.hero_cta} <span aria-hidden>↓</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <RotatingBadge text="próximos encontros" href="#encontros" className="absolute right-6 top-28 hidden text-lime md:grid lg:right-12 lg:top-32" />
      </section>

      {/* FAIXA ------------------------------------------------------------ */}
      <div className="border-b border-line bg-cream py-6 text-green md:py-8">
        <Marquee words={words} />
      </div>

      {/* SOBRE NÓS: dividida ao meio — foto grande à esquerda, texto à direita */}
      <section className="sobre-split" aria-labelledby="sobre-titulo">
        <div className="sobre-foto">
          <Photo src={c.intro_image} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full" />
        </div>
        <div className="sobre-texto">
          <p className="label dash dash-pink reveal">sobre nós</p>
          <h2 id="sobre-titulo" className="reveal">
            {/\snós$/.test(c.intro_title) ? (
              <>
                <span className="italic-serif sobre-frase">{c.intro_title.replace(/\s+nós$/, "")}</span>
                <span className="sobre-logo-wrap">
                  <Logo className="sobre-logo" />
                  <Knot className="sobre-no" />
                </span>
              </>
            ) : (
              <span className="italic-serif sobre-frase">{c.intro_title}</span>
            )}
          </h2>
          <p className="sobre-corpo reveal">{withHighlights(c.intro_text)}</p>
          {c.intro_note && <p className="script -rotate-3 text-5xl text-pink">{c.intro_note}</p>}
          <Link href="/sobre" className="btn btn-outline text-green reveal">
            conheça mais sobre a nós <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS (calendário) --------------------------------- */}
      <EventCalendar id="encontros" events={calendarEvents} today={todayISO()} title={c.events_title} />

      {/* NÓS EM FOTOS ----------------------------------------------------- */}
      {galleryPhotos.length > 0 && (
        <section className="overflow-hidden bg-green py-24 text-cream md:py-36">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
              <SectionHeading kicker="memórias" title={c.gallery_title} dashClass="dash-lime" />
            </div>
            <PhotoCarousel label={c.gallery_title}>
              {galleryPhotos.map((p) => (
                <li key={p.id} className="photo-zoom">
                  <Photo src={p.url} alt={p.alt} sizes="(min-width: 1200px) 25vw, (min-width: 768px) 30vw, 78vw" className="h-full w-full" />
                </li>
              ))}
            </PhotoCarousel>
          </div>
        </section>
      )}

      <InstagramSection handle={c.instagram_handle} title={c.instagram_title} />
    </>
  );
}

/** Frase do topo: Sanchez em caixa alta + a última palavra em script rosa. */
function HeroTagline({ text }: { text: string }) {
  const words = text.trim().replace(/[.!]+$/, "").split(/\s+/);
  const last = words.length > 1 ? words.pop() : undefined;
  return (
    <p className="rise hero-tagline" style={{ ["--delay" as string]: "300ms" }} aria-label={text}>
      <span className="hero-tagline-caps">{words.join(" ")}</span>
      {last && <> <span className="hero-tagline-script">{last}</span></>}
    </p>
  );
}

/** Trechos entre **asteriscos duplos** viram destaque de marca-texto. */
function withHighlights(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="destaque">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
