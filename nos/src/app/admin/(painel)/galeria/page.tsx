import Link from "next/link";
import Image from "next/image";
import { isLocalUpload } from "@/lib/images";
import { getAllPastEventsForAdmin } from "@/lib/gallery";
import { formatMonthYear } from "@/lib/format";
import { Flash } from "@/components/admin/ui";

export default async function GalleryAdmin({ searchParams }: { searchParams: Promise<{ excluido?: string }> }) {
  const { excluido } = await searchParams;
  const list = await getAllPastEventsForAdmin();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-green">eventos passados & fotos</h1>
          <p className="mt-1 text-sm text-muted">
            cada encontro que já aconteceu vira uma galeria. fotos com ★ aparecem também na home, em “nós em fotos”.
          </p>
        </div>
        <Link href="/admin/galeria/novo" className="a-btn a-btn-primary">+ nova galeria</Link>
      </header>
      <Flash show={!!excluido}>galeria excluída.</Flash>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((pe) => (
          <Link key={pe.id} href={`/admin/galeria/${pe.id}`} className="a-card group !p-0 overflow-hidden transition-shadow hover:shadow-lg">
            <div className="grid h-40 grid-cols-3 gap-0.5 bg-mist">
              {pe.photos.slice(0, 3).map((p) => (
                <div key={p.id} className="relative">
                  <Image unoptimized={isLocalUpload(p.url)} src={p.url} alt="" fill sizes="150px" quality={70} className="object-cover" />
                </div>
              ))}
            </div>
            <div className="p-4">
              <p className="font-semibold text-green">{pe.title}</p>
              <p className="text-sm text-muted">
                {formatMonthYear(pe.date)} · {pe.photos.length} fotos · {pe.photos.filter((p) => p.featured).length} na home
                {!pe.published && " · rascunho"}
                {pe.isSample && " · exemplo"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-muted">nenhuma galeria ainda.</p>}
    </div>
  );
}
