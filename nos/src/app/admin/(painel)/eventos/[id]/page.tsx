import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { registrations, waitlistEntries } from "@/lib/db/schema";
import { getEventById, getEventPhotos } from "@/lib/events";
import { formatDateTime, todayISO } from "@/lib/format";
import { EventForm } from "@/components/admin/EventForm";
import { ConfirmButton, PhotoManager } from "@/components/admin/client";
import { Flash, PaymentPill, SpotsBar, StatusPill } from "@/components/admin/ui";
import {
  deleteEventAction,
  deletePhotoAction,
  deleteWaitlistEntryAction,
  duplicateEventAction,
  eventToGalleryAction,
  movePhotoAction,
  togglePhotoFeaturedAction,
  updatePhotoAction,
  uploadPhotoAction,
} from "@/app/admin/actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ criado?: string; duplicado?: string }> };

export default async function EditEventPage({ params, searchParams }: Props) {
  const [{ id }, flags] = await Promise.all([params, searchParams]);
  const event = await getEventById(id);
  if (!event) notFound();
  const [gallery, regs, waitlist] = await Promise.all([
    getEventPhotos(id),
    db.select().from(registrations).where(eq(registrations.eventId, id)).orderBy(desc(registrations.createdAt)).limit(10),
    db.select().from(waitlistEntries).where(eq(waitlistEntries.eventId, id)).orderBy(waitlistEntries.createdAt),
  ]);
  const happened = event.date < todayISO();

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/admin/eventos" className="text-sm underline">← encontros</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-green">{event.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusPill status={event.effective} published={event.published} />
            <div className="w-56"><SpotsBar event={event} /></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/eventos/${event.slug}`} target="_blank" className="a-btn a-btn-soft">ver no site ↗</a>
          <form action={duplicateEventAction.bind(null, event.id)}>
            <button className="a-btn a-btn-soft">duplicar</button>
          </form>
          {happened && (
            <form action={eventToGalleryAction.bind(null, event.id)}>
              <button className="a-btn a-btn-soft">criar galeria de fotos</button>
            </form>
          )}
          <ConfirmButton action={deleteEventAction.bind(null, event.id)} message="excluir este encontro de vez? isso não pode ser desfeito.">
            excluir
          </ConfirmButton>
        </div>
      </header>

      <Flash show={!!flags.criado}>encontro criado ✓ — agora é só revisar, adicionar fotos e marcar “publicado”.</Flash>
      <Flash show={!!flags.duplicado}>cópia criada como rascunho ✓ — ajuste a data e o que mais precisar.</Flash>

      <EventForm event={event} />

      <section className="a-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-green">fotos extras do encontro</h2>
          <p className="text-sm text-muted">aparecem na página do encontro, abaixo da descrição (opcional).</p>
        </div>
        <PhotoManager
          photos={gallery}
          upload={uploadPhotoAction.bind(null, `event:${event.id}`)}
          onToggleFeatured={togglePhotoFeaturedAction}
          onMove={movePhotoAction}
          onDelete={deletePhotoAction}
          onSaveAlt={updatePhotoAction}
          showFeatured={false}
        />
      </section>

      <section className="a-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-green">inscrições recentes</h2>
          <div className="flex gap-2">
            <Link href={`/admin/inscricoes?evento=${event.id}`} className="a-btn a-btn-soft">ver todas</Link>
            <a href={`/api/admin/export?evento=${event.id}`} className="a-btn a-btn-soft">baixar CSV</a>
          </div>
        </div>
        {regs.length === 0 ? (
          <p className="text-sm text-muted">nenhuma inscrição ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead><tr><th>nome</th><th>contato</th><th>pagamento</th><th>quando</th></tr></thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}<span className="block text-xs text-muted">{r.phone}</span></td>
                    <td><PaymentPill registration={r} /></td>
                    <td className="text-muted">{formatDateTime(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="a-card">
        <h2 className="mb-1 text-lg font-semibold text-green">lista de espera ({waitlist.length})</h2>
        <p className="mb-4 text-sm text-muted">quando uma vaga abrir, entre em contato por ordem de chegada.</p>
        {waitlist.length > 0 && (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead><tr><th>#</th><th>nome</th><th>contato</th><th>desde</th><th></th></tr></thead>
              <tbody>
                {waitlist.map((w, i) => (
                  <tr key={w.id}>
                    <td>{i + 1}</td>
                    <td>{w.name}{w.instagram && <span className="block text-xs text-muted">@{w.instagram}</span>}</td>
                    <td>{w.email}<span className="block text-xs text-muted">{w.phone}</span></td>
                    <td className="text-muted">{formatDateTime(w.createdAt)}</td>
                    <td className="text-right">
                      <ConfirmButton action={deleteWaitlistEntryAction.bind(null, w.id)} message="remover da lista de espera?" className="a-btn a-btn-soft !py-1 text-xs">
                        remover
                      </ConfirmButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
