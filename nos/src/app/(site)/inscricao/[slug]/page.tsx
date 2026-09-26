import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFacts } from "@/components/site/EventFacts";
import { RegistrationBlock } from "@/components/site/RegistrationBlock";
import { Photo, SampleBadge, StatusTag } from "@/components/site/ui";
import { getContent } from "@/lib/content";
import { getEventBySlug } from "@/lib/events";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ cancelado?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return event ? { title: `inscrição — ${event.title}`, robots: { index: false } } : {};
}

/** Página enxuta de inscrição — ótima para o link da bio do Instagram. */
export default async function RegistrationPage({ params, searchParams }: Props) {
  const [{ slug }, { cancelado }] = await Promise.all([params, searchParams]);
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const c = await getContent();

  return (
    <section className="mx-auto grid max-w-[1400px] gap-14 px-5 pb-24 pt-28 md:grid-cols-12 md:px-10 md:pt-40">
      <aside className="md:col-span-4">
        <Link href={`/eventos/${event.slug}`} className="photo-zoom relative block">
          <Photo src={event.coverImage} alt={event.coverAlt ?? event.title} sizes="(min-width: 768px) 30vw, 100vw" className="aspect-[16/10] md:aspect-[4/5]" />
          <span className="absolute left-3 top-3 flex flex-wrap gap-2">
            <StatusTag status={event.effective} />
            <SampleBadge show={event.isSample} />
          </span>
        </Link>
        <h2 className="display mt-6 text-4xl text-green">{event.title}</h2>
        <div className="mt-6">
          <EventFacts event={event} />
        </div>
        <Link href={`/eventos/${event.slug}`} className="label link mt-6 inline-block text-green">
          ver todos os detalhes
        </Link>
      </aside>

      <div className="md:col-span-7 md:col-start-6">
        <p className="label dash dash-pink rise text-green">inscrição</p>
        <h1 className="display rise mt-5 text-6xl text-green md:text-8xl" style={{ ["--delay" as string]: "100ms" }}>
          {event.effective === "sold_out" ? "lista de espera" : "quero participar"}
        </h1>
        <p className="italic-serif rise mt-5 max-w-lg text-xl" style={{ ["--delay" as string]: "200ms" }}>
          preenche rapidinho e, depois, é só confirmar o pagamento.
        </p>
        <div className="mt-12">
          <RegistrationBlock event={event} termsText={c.terms_text} cancelled={!!cancelado} />
        </div>
      </div>
    </section>
  );
}
