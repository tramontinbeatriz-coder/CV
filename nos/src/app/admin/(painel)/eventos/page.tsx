import Link from "next/link";
import Image from "next/image";
import { isLocalUpload } from "@/lib/images";
import { getAllEventsForAdmin } from "@/lib/events";
import { formatDayMonth, formatPrice, formatTime } from "@/lib/format";
import { todayISO } from "@/lib/format";
import { Flash, SpotsBar, StatusPill } from "@/components/admin/ui";

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const { excluido } = await searchParams;
  const all = await getAllEventsForAdmin();
  const today = todayISO();
  const upcoming = all.filter((e) => e.date >= today).reverse();
  const past = all.filter((e) => e.date < today);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-green">encontros</h1>
          <p className="mt-1 text-sm text-muted">crie, edite, duplique e acompanhe as vagas de cada encontro.</p>
        </div>
        <Link href="/admin/eventos/novo" className="a-btn a-btn-primary">+ novo encontro</Link>
      </header>
      <Flash show={!!excluido}>encontro excluído.</Flash>

      <EventList title="próximos" list={upcoming} empty="nenhum encontro futuro ainda." />
      <EventList title="já aconteceram" list={past} empty="—" />
    </div>
  );
}

function EventList({ title, list, empty }: { title: string; list: Awaited<ReturnType<typeof getAllEventsForAdmin>>; empty: string }) {
  return (
    <section className="a-card">
      <h2 className="mb-4 text-lg font-semibold text-green">{title}</h2>
      {list.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {list.map((e) => (
            <li key={e.id}>
              <Link href={`/admin/eventos/${e.id}`} className="-mx-3 flex flex-wrap items-center gap-4 rounded-xl px-3 py-4 hover:bg-lime/20">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                  {e.coverImage && <Image unoptimized={isLocalUpload(e.coverImage)} src={e.coverImage} alt="" fill sizes="80px" quality={70} className="object-cover" />}
                </div>
                <div className="min-w-48 flex-1">
                  <p className="font-semibold text-green">
                    {e.title} {e.isSample && <span className="a-pill ml-1 border border-dashed border-green/40 text-xs">exemplo</span>}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDayMonth(e.date)} · {formatTime(e.time)} · {e.locationName || "local a definir"} · {formatPrice(e.priceCents)}
                  </p>
                </div>
                <StatusPill status={e.effective} published={e.published} />
                <div className="w-full sm:w-52"><SpotsBar event={e} /></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
