import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, registrations, waitlistEntries } from "@/lib/db/schema";
import { getContent, isPlaceholder, CONTENT_FIELDS, type ContentKey } from "@/lib/content";
import { getUpcomingEvents } from "@/lib/events";
import { formatDateTime, formatDayMonth, formatPrice, formatTime } from "@/lib/format";
import { config } from "@/lib/config";
import { PaymentPill, SpotsBar, StatusPill } from "@/components/admin/ui";

export default async function Dashboard() {
  const [upcoming, content, recent, [totals], [wait]] = await Promise.all([
    getUpcomingEvents(),
    getContent(),
    db
      .select({ r: registrations, title: events.title })
      .from(registrations)
      .innerJoin(events, eq(events.id, registrations.eventId))
      .orderBy(desc(registrations.createdAt))
      .limit(8),
    db
      .select({
        paid: sql<number>`sum(case when ${registrations.paymentStatus} = 'paid' then 1 else 0 end)`,
        revenue: sql<number>`sum(case when ${registrations.paymentStatus} = 'paid' then ${registrations.amountCents} else 0 end)`,
      })
      .from(registrations),
    db.select({ n: sql<number>`count(*)` }).from(waitlistEntries),
  ]);
  const placeholders = (Object.keys(CONTENT_FIELDS) as ContentKey[]).filter((k) => isPlaceholder(content[k]));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">oi! 🤍</p>
          <h1 className="display text-5xl text-green">visão geral</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/eventos/novo" className="a-btn a-btn-primary">+ novo encontro</Link>
          <Link href="/admin/galeria" className="a-btn a-btn-soft">adicionar fotos</Link>
        </div>
      </header>

      {config.paymentProvider === "mock" && (
        <div className="a-card border-pink bg-pink/15">
          <p className="font-semibold text-green">pagamentos em modo teste</p>
          <p className="mt-1 text-sm">
            ninguém é cobrado de verdade enquanto <code>PAYMENT_PROVIDER=mock</code>. para receber pagamentos, siga o passo a passo em
            <code> docs/PAGAMENTOS.md</code>.
          </p>
        </div>
      )}
      {placeholders.length > 0 && (
        <div className="a-card border-lime bg-lime/25">
          <p className="font-semibold text-green">{placeholders.length} textos ainda estão como [placeholder]</p>
          <p className="mt-1 text-sm">
            {placeholders.map((k) => CONTENT_FIELDS[k].label).join(" · ")} —{" "}
            <Link href="/admin/conteudo" className="underline">editar agora</Link>
          </p>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="próximos encontros" value={String(upcoming.length)} />
        <Stat label="inscrições pagas" value={String(totals?.paid ?? 0)} />
        <Stat label="valor confirmado" value={formatPrice(Number(totals?.revenue ?? 0))} />
        <Stat label="na lista de espera" value={String(wait?.n ?? 0)} />
      </section>

      <section className="a-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-green">próximos encontros</h2>
          <Link href="/admin/eventos" className="text-sm underline">ver todos</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">nenhum encontro publicado. <Link className="underline" href="/admin/eventos/novo">criar o primeiro</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr><th>encontro</th><th>data</th><th>status</th><th>vagas</th><th></th></tr>
              </thead>
              <tbody>
                {upcoming.map((e) => (
                  <tr key={e.id}>
                    <td className="font-semibold text-green">{e.title}</td>
                    <td>{formatDayMonth(e.date)} · {formatTime(e.time)}</td>
                    <td><StatusPill status={e.effective} /></td>
                    <td className="min-w-44"><SpotsBar event={e} /></td>
                    <td className="text-right"><Link className="a-btn a-btn-soft !py-1" href={`/admin/eventos/${e.id}`}>editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="a-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-green">últimas inscrições</h2>
          <Link href="/admin/inscricoes" className="text-sm underline">ver todas</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>nome</th><th>encontro</th><th>pagamento</th><th>quando</th></tr></thead>
            <tbody>
              {recent.map(({ r, title }) => (
                <tr key={r.id}>
                  <td>{r.name}<span className="block text-xs text-muted">{r.email}</span></td>
                  <td>{title}</td>
                  <td><PaymentPill registration={r} /></td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="a-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="display mt-2 text-4xl normal-case text-green">{value}</p>
    </div>
  );
}
