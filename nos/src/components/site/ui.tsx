import Image from "next/image";
import { isLocalUpload } from "@/lib/images";
import Link from "next/link";
import type { EventView } from "@/lib/events";
import { formatDayMonth, formatPrice, formatShortDate, formatTime, weekdayOf } from "@/lib/format";
import { STATUS_LABEL, canRegister, type EffectiveStatus } from "@/lib/spots";
import { Knot } from "../brand/Logo";

export function Photo({
  src,
  alt,
  sizes,
  className,
  priority,
  imgClassName,
}: {
  src?: string | null;
  alt?: string | null;
  sizes: string;
  className?: string;
  priority?: boolean;
  imgClassName?: string;
}) {
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className ?? "") ? "" : "relative"} overflow-hidden bg-mist ${className ?? ""}`}>
      {src ? (
        <Image unoptimized={isLocalUpload(src)}
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          quality={70}
          className={`object-cover ${imgClassName ?? ""}`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Knot className="w-16 text-green/20" />
        </div>
      )}
    </div>
  );
}

export function StatusTag({ status, className }: { status: EffectiveStatus; className?: string }) {
  const styles: Record<EffectiveStatus, string> = {
    open: "bg-lime text-green",
    last_spots: "bg-pink text-green",
    sold_out: "border border-current text-current",
    closed: "bg-mist text-ink/60",
  };
  return (
    <span className={`tag ${styles[status]} ${className ?? ""}`}>
      {status === "last_spots" && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-green" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SampleBadge({ show, className }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className={`tag border border-dashed border-current bg-cream/80 text-green ${className ?? ""}`} title="conteúdo de exemplo — edite ou apague no painel">
      conteúdo de exemplo
    </span>
  );
}

/** Link/botão principal de um encontro, conforme o status. */
export function EventCta({
  event,
  label = "quero participar",
  className = "btn btn-green",
}: {
  event: EventView;
  label?: string;
  className?: string;
}) {
  if (canRegister(event.effective)) {
    return (
      <Link href={`/inscricao/${event.slug}`} className={className}>
        {label} <span aria-hidden>→</span>
      </Link>
    );
  }
  if (event.effective === "sold_out") {
    return (
      <Link href={`/inscricao/${event.slug}`} className={className.replace("btn-green", "btn-outline")}>
        lista de espera
      </Link>
    );
  }
  return (
    <span className={`${className} pointer-events-none opacity-50`} aria-disabled>
      encerrado
    </span>
  );
}

export function SpotsLine({ event }: { event: EventView }) {
  if (event.effective === "closed") return <span>encontro encerrado</span>;
  if (event.effective === "sold_out") return <span>vagas esgotadas</span>;
  return (
    <span>
      {event.available} {event.available === 1 ? "vaga restante" : "vagas restantes"}
      <span className="opacity-50"> · de {event.totalSpots}</span>
    </span>
  );
}

/** Card editorial de encontro. `feature` = destaque grande (primeiro da lista). */
export function EventCard({ event, variant = "grid", index = 0 }: { event: EventView; variant?: "feature" | "grid"; index?: number }) {
  const href = `/eventos/${event.slug}`;
  const meta = (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <div>
        <dt className="label text-muted">quando</dt>
        <dd>
          {weekdayOf(event.date)}, {formatDayMonth(event.date)} · {formatTime(event.time)}
        </dd>
      </div>
      <div>
        <dt className="label text-muted">onde</dt>
        <dd>{event.locationName || "local a definir"}</dd>
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
  );

  if (variant === "feature") {
    return (
      <article className="reveal grid items-end gap-8 md:grid-cols-12 md:gap-10">
        <Link href={href} className="photo-zoom group relative block md:col-span-7">
          <Photo src={event.coverImage} alt={event.coverAlt ?? event.title} sizes="(min-width: 768px) 58vw, 100vw" className="aspect-[4/5] rounded-[2px] md:aspect-[5/4]" />
          <span className="absolute left-4 top-4 flex flex-wrap gap-2">
            <StatusTag status={event.effective} />
            <SampleBadge show={event.isSample} />
          </span>
          <span className="display absolute -bottom-6 right-4 text-7xl text-lime drop-shadow-sm md:-bottom-10 md:text-[9rem]">
            {formatShortDate(event.date)}
          </span>
        </Link>
        <div className="md:col-span-5 md:pb-6">
          <p className="label dash dash-pink mb-5 text-muted">próximo encontro</p>
          <h3 className="display text-5xl text-green md:text-6xl">
            <Link href={href} className="hover:opacity-70">{event.title}</Link>
          </h3>
          {event.tagline && <p className="italic-serif mt-4 text-xl text-ink/80">“{event.tagline}”</p>}
          {event.summary && <p className="mt-4 max-w-md text-[0.95rem] text-ink/80">{event.summary}</p>}
          <div className="mt-8 border-t border-line pt-6">{meta}</div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <EventCta event={event} />
            <Link href={href} className="label link">detalhes</Link>
          </div>
        </div>
      </article>
    );
  }

  // grid: alterna alturas para criar um ritmo assimétrico
  const offset = index % 2 === 1 ? "md:mt-24" : "";
  return (
    <article className={`reveal group ${offset}`} style={{ ["--delay" as string]: `${(index % 2) * 120}ms` }}>
      <Link href={href} className="photo-zoom relative block">
        <Photo src={event.coverImage} alt={event.coverAlt ?? event.title} sizes="(min-width: 768px) 45vw, 100vw" className={index % 3 === 1 ? "aspect-square" : "aspect-[4/5]"} />
        <span className="absolute left-4 top-4 flex flex-wrap gap-2">
          <StatusTag status={event.effective} />
          <SampleBadge show={event.isSample} />
        </span>
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="label text-muted">
            {weekdayOf(event.date)} · {formatDayMonth(event.date)} · {formatTime(event.time)}
          </p>
          <h3 className="display mt-2 text-4xl text-green">
            <Link href={href} className="hover:opacity-70">{event.title}</Link>
          </h3>
        </div>
        <span className="display shrink-0 text-4xl text-pink">{formatShortDate(event.date)}</span>
      </div>
      {event.summary && <p className="mt-3 max-w-md text-[0.95rem] text-ink/80">{event.summary}</p>}
      <div className="mt-5 border-t border-line pt-5">{meta}</div>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <EventCta event={event} />
        <Link href={href} className="label link">detalhes</Link>
      </div>
    </article>
  );
}

export function Marquee({ words, className }: { words: string[]; className?: string }) {
  const items = [...words, ...words];
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`} aria-hidden>
      <div className="marquee-track inline-flex items-center">
        {[0, 1].map((k) => (
          <span key={k} className="inline-flex items-center">
            {items.map((w, i) => (
              <span key={`${k}-${i}`} className="inline-flex items-center">
                <span className={i % 2 ? "italic-serif px-6 text-4xl md:text-6xl" : "display px-6 text-4xl md:text-6xl"}>{w}</span>
                <Knot className={`w-6 md:w-8 ${i % 3 === 0 ? "text-pink" : i % 3 === 1 ? "text-lime" : "text-current"}`} />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Selo circular com texto girando e o "nó" no centro. */
export function RotatingBadge({ text, href, className }: { text: string; href: string; className?: string }) {
  const repeated = `${text} · ${text} · `;
  return (
    <a href={href} className={`group aspect-square w-32 place-items-center md:w-40 ${className ?? "relative grid"}`} aria-label={text}>
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current" style={{ fontFamily: "var(--font-slab)", fontSize: 15.5, letterSpacing: 4.2, textTransform: "uppercase" }}>
          <textPath href="#badge-circle">{repeated}</textPath>
        </text>
      </svg>
      <Knot className="w-12 text-pink transition-transform duration-700 group-hover:rotate-180 group-hover:scale-110 md:w-14" />
    </a>
  );
}

export function SectionHeading({
  kicker,
  title,
  className,
  dashClass = "dash-pink",
}: {
  kicker?: string;
  title: string;
  className?: string;
  dashClass?: string;
}) {
  return (
    <div className={`reveal ${className ?? ""}`}>
      {kicker && <p className={`label dash ${dashClass} mb-5 opacity-80`}>{kicker}</p>}
      <h2 className="display text-5xl md:text-7xl">{title}</h2>
    </div>
  );
}
