import type { Metadata } from "next";
import Link from "next/link";
import { Knot } from "@/components/brand/Logo";
import { Lightbox } from "@/components/site/Lightbox";
import { SampleBadge } from "@/components/site/ui";
import { getPublishedPastEvents } from "@/lib/gallery";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "eventos passados",
  description: "fotos dos encontros da nós em porto alegre: como foi, quem veio, o clima de cada experiência.",
};

export default async function PastEventsPage() {
  const pastEvents = await getPublishedPastEvents();

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pb-10 pt-32 md:px-10 md:pt-44">
        <p className="label dash dash-pink rise text-green">arquivo</p>
        <h1 className="display rise mt-6 text-[17vw] text-green md:text-[10rem]" style={{ ["--delay" as string]: "100ms" }}>
          já foi
          <br />
          <span className="text-pink">assim</span>
        </h1>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <p className="italic-serif rise max-w-xl text-2xl" style={{ ["--delay" as string]: "220ms" }}>
            um pouco do que aconteceu nos nossos encontros. clique nas fotos para ver de perto.
          </p>
          {pastEvents.length > 1 && (
            <nav className="rise flex flex-wrap gap-2" aria-label="encontros" style={{ ["--delay" as string]: "300ms" }}>
              {pastEvents.map((pe) => (
                <a key={pe.id} href={`#${pe.slug}`} className="tag border border-green/40 text-green transition-colors hover:bg-green hover:text-cream">
                  {pe.title}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      {pastEvents.length === 0 ? (
        <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-5 py-20 md:px-10">
          <Knot className="w-12 text-pink" />
          <p className="italic-serif text-2xl text-green">as primeiras fotos chegam logo depois do primeiro encontro.</p>
        </div>
      ) : (
        pastEvents.map((pe, i) => (
          <section key={pe.id} id={pe.slug} className={i % 2 ? "bg-mist" : ""}>
            <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
              <header className="reveal mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
                <div className="md:col-span-7">
                  <p className="label text-muted">
                    {[pe.location, formatMonthYear(pe.date)].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="display mt-3 text-6xl text-green md:text-8xl">{pe.title}</h2>
                </div>
                <div className="md:col-span-4 md:col-start-9">
                  <SampleBadge show={pe.isSample} className="mb-4" />
                  {pe.description && <p className="italic-serif text-xl leading-snug">{pe.description}</p>}
                </div>
              </header>
              {pe.photos.length > 0 ? (
                <Lightbox
                  columns="columns-2 md:columns-3 lg:columns-4"
                  photos={pe.photos.map((p) => ({ id: p.id, url: p.url, alt: p.alt || pe.title, width: p.width, height: p.height }))}
                />
              ) : (
                <p className="text-muted">fotos em breve.</p>
              )}
            </div>
          </section>
        ))
      )}

      <section className="bg-green py-20 text-center text-cream md:py-28">
        <p className="script -rotate-2 text-6xl text-lime md:text-7xl">o próximo pode ter você</p>
        <Link href="/eventos" className="btn btn-lime mt-10">
          ver próximos encontros →
        </Link>
      </section>
    </>
  );
}
