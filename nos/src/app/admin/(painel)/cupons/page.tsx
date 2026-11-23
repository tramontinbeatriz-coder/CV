import { AdminForm, ConfirmButton } from "@/components/admin/client";
import { createCouponAction, deleteCouponAction, setCouponActiveAction } from "@/app/admin/actions";
import { describeCoupon, listCouponsWithUses } from "@/lib/coupons";
import { getAllEventsForAdmin } from "@/lib/events";
import { todayISO } from "@/lib/format";

const br = (iso: string) => iso.split("-").reverse().join("/");

export default async function CouponsAdminPage() {
  const [list, allEvents] = await Promise.all([listCouponsWithUses(), getAllEventsForAdmin()]);
  const today = todayISO();
  const upcoming = allEvents.filter((e) => e.date >= today && e.priceCents > 0).reverse();
  const titleById = new Map(allEvents.map((e) => [e.id, e.title]));

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="display text-5xl text-green">cupons de desconto</h1>
        <p className="mt-1 text-sm text-muted">
          a pessoa digita o código na inscrição e o valor já vai com desconto para o pagamento. o site confere tudo
          (validade, limite de usos, encontro) antes de abrir o pagamento.
        </p>
      </header>

      <AdminForm action={createCouponAction} submitLabel="criar cupom" stickyFooter={false}>
        <section className="a-card space-y-4">
          <h2 className="text-lg font-semibold text-green">novo cupom</h2>
          <label className="block">
            <span className="a-label">código</span>
            <input name="code" className="a-input uppercase" placeholder="ex.: AMIGAS10" maxLength={30} autoComplete="off" required />
            <span className="a-help">letras e números, sem espaço. maiúsculas e minúsculas tanto faz.</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="a-label">tipo de desconto</span>
              <select name="kind" className="a-input" defaultValue="percent">
                <option value="percent">porcentagem (%)</option>
                <option value="fixed">valor fixo (R$)</option>
              </select>
            </label>
            <label className="block">
              <span className="a-label">desconto</span>
              <input name="value" inputMode="decimal" className="a-input" placeholder="10" required />
              <span className="a-help">porcentagem: só o número (10 = 10%). valor fixo: em reais (20,00).</span>
            </label>
          </div>
          <label className="block">
            <span className="a-label">vale para</span>
            <select name="eventId" className="a-input" defaultValue="">
              <option value="">todos os encontros</option>
              {upcoming.map((e) => (
                <option key={e.id} value={e.id}>só: {e.title} ({br(e.date)})</option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="a-label">limite de usos (opcional)</span>
              <input name="maxUses" type="number" min={1} inputMode="numeric" className="a-input" placeholder="sem limite" />
              <span className="a-help">quantas inscrições podem usar esse cupom no total.</span>
            </label>
            <label className="block">
              <span className="a-label">válido até (opcional)</span>
              <input name="expiresOn" type="date" className="a-input" min={today} />
              <span className="a-help">vale até o fim desse dia. em branco = sem validade.</span>
            </label>
          </div>
        </section>
      </AdminForm>

      <section className="a-card">
        <h2 className="mb-4 text-lg font-semibold text-green">cupons criados</h2>
        {list.length === 0 ? (
          <p className="text-sm text-muted">nenhum cupom ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((c) => {
              const expired = c.expiresOn != null && c.expiresOn < today;
              const usedUp = c.maxUses != null && c.paidUses >= c.maxUses;
              const live = c.active && !expired && !usedUp;
              return (
                <li key={c.id} className={`flex flex-wrap items-start justify-between gap-4 py-4 ${live ? "" : "opacity-60"}`}>
                  <div>
                    <p className="font-mono text-base font-semibold text-green">
                      {c.code} <span className="font-sans text-sm font-normal">· {describeCoupon(c)}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {[
                        c.eventId ? `só: ${titleById.get(c.eventId) ?? "encontro"}` : "todos os encontros",
                        `${c.paidUses}${c.maxUses != null ? ` de ${c.maxUses}` : ""} ${c.paidUses === 1 ? "uso" : "usos"} (pagos)`,
                        c.expiresOn ? `válido até ${br(c.expiresOn)}` : "sem validade",
                      ].join(" · ")}
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {!c.active ? "desativado" : expired ? "expirado" : usedUp ? "esgotado" : <span className="text-green">ativo ✓</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={setCouponActiveAction.bind(null, c.id, !c.active)}>
                      <button className="a-btn a-btn-soft !py-1 text-xs">{c.active ? "desativar" : "reativar"}</button>
                    </form>
                    <ConfirmButton
                      action={deleteCouponAction.bind(null, c.id)}
                      message={`apagar o cupom ${c.code}? as inscrições que já usaram continuam com o desconto registrado.`}
                      className="a-btn !py-1 text-xs text-muted hover:text-[#b23b5a]"
                    >
                      apagar
                    </ConfirmButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
