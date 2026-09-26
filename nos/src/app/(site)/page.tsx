import Link from "next/link";
import { Knot, Lockup } from "@/components/brand/Logo";
import { EventCard, Marquee, Photo, RotatingBadge, SectionHeading } from "@/components/site/ui";
import { InstagramSection } from "@/components/site/InstagramSection";
import { getContent, instagramUrl } from "@/lib/content";
import { getUpcomingEvents } from "@/lib/events";
import { getFeaturedPhotos } from "@/lib/gallery";

export default async function HomePage() {
  const [c, events, featured] = await Promise.all([getContent(), getUpcomingEvents(5), getFeaturedPhotos(7)]);
  const [first, ...rest] = events;
  const words = c.marquee_words.split(",").map((w) => w.trim()).filter(Boolean);

  return (
    <>
      {/* HERO ------------------------------------------------------------ */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-green text-cream">
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

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 pb-10 pt-28 md:px-10 md:pb-14 md:pt-36">
          <p className="label rise max-w-xs text-cream/90 md:max-w-none">{c.hero_kicker}</p>

          <div className="mt-auto grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="rise text-[34vw] leading-none md:text-[19vw] lg:text-[15.5rem]" style={{ ["--delay" as string]: "120ms" }}>
                <Lockup entre className="text-cream" />
                <span className="sr-only">nós</span>
              </h1>
            </div>
            <div className="md:col-span-4 md:pb-8">
              <p className="rise italic-serif text-3xl leading-[1.1] md:text-4xl" style={{ ["--delay" as string]: "300ms" }}>
                {c.hero_title}
              </p>
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

      {/* O QUE É A NÓS ---------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-40">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeading kicker="sobre" title={c.intro_title} className="text-green" />
            <div className="reveal relative mt-14 hidden md:block" style={{ ["--delay" as string]: "150ms" }}>
              <Photo src={c.about_image_1} alt="" sizes="30vw" className="aspect-[4/5] w-3/4 -rotate-2" />
              <Photo src={c.about_image_2} alt="" sizes="20vw" className="absolute -bottom-16 right-0 aspect-square w-1/2 rotate-3 border-8 border-cream" />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-24">
            <p className="reveal text-2xl leading-snug md:text-[2.1rem] md:leading-[1.25]">{c.intro_text}</p>
            <p className="reveal script mt-10 -rotate-3 text-6xl text-pink md:text-7xl" style={{ ["--delay" as string]: "200ms" }}>
              {c.intro_note}
            </p>
            <div className="reveal mt-12 flex gap-6" style={{ ["--delay" as string]: "300ms" }}>
              <Link href="/sobre" className="btn btn-outline text-green">
                conheça a nós
              </Link>
            </div>
            <div className="reveal relative mt-14 md:hidden">
              <Photo src={c.about_image_1} alt="" sizes="75vw" className="aspect-[4/5] w-3/4 -rotate-2" />
              <Photo src={c.about_image_2} alt="" sizes="50vw" className="absolute -bottom-10 right-0 aspect-square w-1/2 rotate-3 border-8 border-cream" />
            </div>
          </div>
        </div>
      </section>

      {/* PRÓXIMOS ENCONTROS ----------------------------------------------- */}
      <section id="encontros" className="bg-mist py-24 md:py-36">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
            <SectionHeading kicker="agenda" title={c.events_title} className="text-green" />
            <Link href="/eventos" className="label link reveal text-green">ver agenda completa →</Link>
          </div>

          {first ? (
            <>
              <EventCard event={first} variant="feature" />
              {rest.length > 0 && (
                <div className="mt-28 grid gap-16 md:grid-cols-2 md:gap-x-16">
                  {rest.map((e, i) => (
                    <EventCard key={e.id} event={e} index={i} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyAgenda handle={c.instagram_handle} />
          )}
        </div>
      </section>

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

function EmptyAgenda({ handle }: { handle: string }) {
  return (
    <div className="reveal flex flex-col items-start gap-6 border-t border-line pt-12 text-green md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-5">
        <Knot className="w-14 text-pink wobble" />
        <p className="italic-serif text-3xl md:text-4xl">os próximos encontros estão sendo preparados.</p>
      </div>
      <a href={instagramUrl(handle)} target="_blank" rel="noreferrer" className="btn btn-green">
        acompanhe no instagram
      </a>
    </div>
  );
}
