import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { listRegistrations, listWaitlist } from "@/lib/admin-queries";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PAYMENT_LABEL, PaymentPill } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/client";
import { setRegistrationStatusAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ evento?: string; status?: string; q?: string; tipo?: string }> };

const STATUS_OPTIONS: [string, string][] = [
  ["pending", PAYMENT_LABEL.pending],
  ["paid", PAYMENT_LABEL.paid],
  ["failed", PAYMENT_LABEL.failed],
  ["cancelled", PAYMENT_LABEL.cancelled],
  ["refunded", PAYMENT_LABEL.refunded],
];

export default async function RegistrationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const waitlistMode = sp.tipo === "espera";
  const allEvents = await db.select({ id: events.id, title: events.title, date: events.date }).from(events).orderBy(desc(events.date));
  const exportQuery = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl text-green">inscrições</h1>
          <p className="mt-1 text-sm text-muted">todas as pessoas inscritas, com status do pagamento. dá para filtrar e baixar em CSV (abre no excel/google planilhas).</p>
        </div>
        <a href={`/api/admin/export?${exportQuery}`} className="a-btn a-btn-primary">baixar CSV</a>
      </header>

      <nav className="flex gap-2">
        <Link href="/admin/inscricoes" className={`a-btn ${!waitlistMode ? "a-btn-primary" : "a-btn-soft"}`}>inscrições</Link>
        <Link href="/admin/inscricoes?tipo=espera" className={`a-btn ${waitlistMode ? "a-btn-primary" : "a-btn-soft"}`}>lista de espera</Link>
      </nav>

      <form className="a-card flex flex-wrap items-end gap-4 !py-4">
        {waitlistMode && <input type="hidden" name="tipo" value="espera" />}
        <label className="min-w-56 flex-1">
          <span className="a-label">encontro</span>
          <select name="evento" defaultValue={sp.evento ?? ""} className="a-input">
            <option value="">todos</option>
            {allEvents.map((e) => (
              <option key={e.id} value={e.id}>{e.title} ({e.date.split("-").reverse().join("/")})</option>
            ))}
          </select>
        </label>
        {!waitlistMode && (
          <>
            <label>
              <span className="a-label">pagamento</span>
              <select name="status" defaultValue={sp.status ?? ""} className="a-input">
                <option value="">todos</option>
                {[...STATUS_OPTIONS, ["expired", PAYMENT_LABEL.expired] as [string, string]].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <label className="min-w-48 flex-1">
              <span className="a-label">buscar</span>
              <input name="q" defaultValue={sp.q ?? ""} placeholder="nome, e-mail ou telefone" className="a-input" />
            </label>
          </>
        )}
        <button className="a-btn a-btn-soft">filtrar</button>
      </form>

      {waitlistMode ? <WaitlistTable eventId={sp.evento} /> : <RegistrationsTable filters={{ eventId: sp.evento, status: sp.status, q: sp.q }} />}
    </div>
  );
}

async function RegistrationsTable({ filters }: { filters: { eventId?: string; status?: string; q?: string } }) {
  const rows = await listRegistrations(filters);
  const paid = rows.filter(({ r }) => r.paymentStatus === "paid");
  return (
    <section className="a-card">
      <p className="mb-4 text-sm text-muted">
        {rows.length} {rows.length === 1 ? "inscrição" : "inscrições"} · {paid.length} pagas · {formatPrice(paid.reduce((s, { r }) => s + r.amountCents, 0))}
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">nada por aqui com esses filtros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead>
              <tr><th>nome</th><th>e-mail</th><th>telefone</th><th>encontro</th><th>pagamento</th><th>inscrição em</th><th>mudar status</th></tr>
            </thead>
            <tbody>
              {rows.map(({ r, eventTitle }) => (
                <tr key={r.id}>
                  <td className="font-medium">
                    {r.name}
                    <span className="block text-xs font-normal text-muted">
                      {[r.instagram && `@${r.instagram}`, r.city, r.discoverySource].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  <td><a className="underline" href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td className="whitespace-nowrap">
                    <a className="underline" href={`https://wa.me/55${r.phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "")}`} target="_blank" rel="noreferrer">{r.phone}</a>
                  </td>
                  <td>{eventTitle}</td>
                  <td><PaymentPill registration={r} /><span className="block text-xs text-muted">{formatPrice(r.amountCents)}</span></td>
                  <td className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</td>
                  <td><StatusSelect action={setRegistrationStatusAction.bind(null, r.id)} current={r.paymentStatus} options={STATUS_OPTIONS} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        dica: marcar como “pago ✓” manualmente (ex.: pix direto) ocupa a vaga e envia a confirmação. “cancelado” ou “reembolsado” libera a vaga.
        o reembolso em si é feito no painel do provedor de pagamento.
      </p>
    </section>
  );
}

async function WaitlistTable({ eventId }: { eventId?: string }) {
  const rows = await listWaitlist(eventId);
  return (
    <section className="a-card">
      <p className="mb-4 text-sm text-muted">{rows.length} na lista de espera</p>
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>nome</th><th>e-mail</th><th>telefone</th><th>encontro</th><th>entrou em</th></tr></thead>
            <tbody>
              {rows.map(({ w, eventTitle }) => (
                <tr key={w.id}>
                  <td>{w.name}{w.instagram && <span className="block text-xs text-muted">@{w.instagram}</span>}</td>
                  <td>{w.email}</td>
                  <td>{w.phone}</td>
                  <td>{eventTitle}</td>
                  <td className="text-muted">{formatDateTime(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
