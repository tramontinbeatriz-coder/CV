import Link from "next/link";
import { Knot, Lockup, Logo } from "@/components/brand/Logo";
import { EventCalendar } from "@/components/site/EventCalendar";
import { Marquee, Photo, RotatingBadge, SectionHeading } from "@/components/site/ui";
import { InstagramSection } from "@/components/site/InstagramSection";
import { getContent } from "@/lib/content";
import { getUpcomingEvents, toCalendarEvent } from "@/lib/events";
import { todayISO } from "@/lib/format";
import { getFeaturedPhotos } from "@/lib/gallery";

export default async function HomePage() {
  const [c, events, featured] = await Promise.all([getContent(), getUpcomingEvents(), getFeaturedPhotos(7)]);
  const calendarEvents = events.map(toCalendarEvent);
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

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 pb-10 pt-28 md:px-10 md:pb-14 md:pt-32">
          <p className="label rise max-w-xs text-cream/90 md:max-w-none">{c.hero_kicker}</p>

          <div className="mt-10 grid items-end gap-10 md:mt-20 md:grid-cols-12">
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
                <Logo className="sobre-logo" />
              </>
            ) : (
              <span className="italic-serif sobre-frase">{c.intro_title}</span>
            )}
          </h2>
          <p className="sobre-corpo reveal">{c.intro_text}</p>
          {c.intro_note && <p className="script -rotate-3 text-5xl text-pink">{c.intro_note}</p>}
          <Link href="/sobre" className="btn btn-outline text-green reveal">
            conheça mais sobre a nós <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS (calendário) --------------------------------- */}
      <EventCalendar id="encontros" events={calendarEvents} today={todayISO()} title={c.events_title} />

      {/* NÓS EM FOTOS ----------------------------------------------------- */}
      {featured.length > 0 && (
        <section className="overflow-hidden bg-green py-24 text-cream md:py-36">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
              <SectionHeading kicker="memórias" title={c.gallery_title} dashClass="dash-lime" />
              <p className="script reveal -rotate-3 text-5xl text-lime md:text-6xl">foi assim…</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5">
              {featured.map((p, i) => {
                const layout = [
                  "col-span-2 md:col-span-5 md:row-span-2 aspect-[4/5]",
                  "md:col-span-4 aspect-square md:mt-16",
                  "md:col-span-3 aspect-[3/4]",
                  "md:col-span-3 aspect-[3/4] md:-mt-10",
                  "md:col-span-4 aspect-[4/3]",
                  "col-span-2 md:col-span-4 aspect-[16/10] md:col-start-2",
                  "md:col-span-6 aspect-[16/9]",
                ][i % 7];
                const tilt = ["", "md:rotate-1", "md:-rotate-1", "", "md:rotate-[0.6deg]", "", "md:-rotate-[0.6deg]"][i % 7];
                return (
                  <figure key={p.id} className={`reveal photo-zoom ${layout} ${tilt}`} style={{ ["--delay" as string]: `${(i % 3) * 100}ms` }}>
                    <Photo src={p.url} alt={p.alt ?? p.eventTitle} sizes="(min-width: 768px) 40vw, 50vw" className="h-full w-full" />
                  </figure>
                );
              })}
            </div>
            <div className="mt-16 flex justify-center">
              <Link href="/passados" className="btn btn-lime reveal">
                ver todos os encontros <span aria-hidden>→</span>
              </Link>
            </div>
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
