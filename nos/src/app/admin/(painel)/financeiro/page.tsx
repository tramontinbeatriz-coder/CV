import { AdminForm, ConfirmButton } from "@/components/admin/client";
import { addLedgerEntryAction, clearFinanceSheetAction, clearLedgerEntryAction, saveFinanceSheetAction } from "@/app/admin/actions";
import { financeWritable, getFinance, getFinanceSheetUrl, serviceAccountEmail, serviceAccountStatus } from "@/lib/finance";
import type { FinanceRow, FinanceSummary } from "@/lib/finance-sheet";
import { formatMonthYear } from "@/lib/format";

export const dynamic = "force-dynamic";

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const money = (cents: number) => (cents === 0 ? <span className="text-muted">—</span> : brl(cents));
const profitClass = (cents: number) => (cents < 0 ? "text-[#b23b5a]" : "text-green");

function Stat({ label, value, help, tone }: { label: string; value: string; help?: string; tone?: string }) {
  return (
    <div className="a-card">
      <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone ?? "text-green"}`}>{value}</p>
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
    </div>
  );
}

function Entries({ row, writable }: { row: FinanceRow; writable: boolean }) {
  if (row.entries.length === 0) return null;
  return (
    <details className="mt-1 text-xs">
      <summary className="cursor-pointer text-muted hover:text-green">
        {row.entries.length} {row.entries.length === 1 ? "lançamento" : "lançamentos"} na planilha
      </summary>
      <ul className="mt-2 space-y-1">
        {row.entries.map((e, i) => (
          <li key={i} className="flex justify-between gap-4">
            <span>
              {e.description || <span className="text-muted">(sem descrição)</span>}
              {e.method && <span className="text-muted"> · {e.method}</span>}
            </span>
            <span className="flex items-start gap-2">
              <span className={e.kind === "receita" ? "text-green" : ""}>
                {e.kind === "receita" ? "+" : "−"} {brl(e.cents)}
              </span>
              {writable && (
                <ConfirmButton
                  action={clearLedgerEntryAction.bind(null, e.row, e.group, e.description, e.cents)}
                  message={`apagar "${e.description || e.group}" (${brl(e.cents)}) da planilha? a linha ${e.row} fica em branco.`}
                  className="text-muted hover:text-[#b23b5a]"
                >
                  apagar
                </ConfirmButton>
              )}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Table({ rows, showSite, writable }: { rows: FinanceRow[]; showSite: boolean; writable: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="a-table w-full">
        <thead>
          <tr>
            <th className="text-left">{showSite ? "encontro" : "categoria"}</th>
            {showSite && <th className="text-right">vendas no site</th>}
            <th className="text-right">{showSite ? "outras receitas" : "receitas"}</th>
            <th className="text-right">gastos</th>
            <th className="text-right">lucro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="align-top">
              <td>
                <p className="font-semibold text-green">{r.title}</p>
                <p className="text-xs text-muted">
                  {[
                    r.date ? formatMonthYear(r.date) : showSite ? "só na planilha" : null,
                    r.sheetNames.length && r.sheetNames.some((n) => n !== r.title) ? `na planilha: ${r.sheetNames.join(", ")}` : null,
                    r.eventId && r.entries.length === 0 ? "nada lançado na planilha ainda" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {r.maybeDuplicate && (
                  <p className="mt-1 text-xs font-semibold text-[#b23b5a]">
                    ⚠ tem &quot;ingresso&quot; lançado na planilha e também vendas no site. se for a mesma venda, ela está contada duas vezes.
                  </p>
                )}
                <Entries row={r} writable={writable} />
              </td>
              {showSite && (
                <td className="whitespace-nowrap text-right">
                  {money(r.siteRevenueCents)}
                  {r.siteTickets > 0 && <p className="text-xs text-muted">{r.siteTickets} {r.siteTickets === 1 ? "ingresso" : "ingressos"}</p>}
                </td>
              )}
              <td className="whitespace-nowrap text-right">{money(r.sheetRevenueCents)}</td>
              <td className="whitespace-nowrap text-right">{money(r.expenseCents)}</td>
              <td className={`whitespace-nowrap text-right font-semibold ${profitClass(r.profitCents)}`}>{brl(r.profitCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NewEntry({ summary }: { summary: FinanceSummary }) {
  const names = [
    ...new Set([
      ...summary.rows.flatMap((r) => (r.sheetNames.length ? r.sheetNames : [r.title])),
      ...summary.other.flatMap((r) => r.sheetNames),
      "Investimento",
      "Estoque",
    ]),
  ];
  return (
    <AdminForm action={addLedgerEntryAction} submitLabel="lançar na planilha" stickyFooter={false} resetOnSuccess>
      <section className="a-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-green">novo lançamento</h2>
          <p className="text-xs text-muted">vai direto para a próxima linha livre da aba Razão, igual a digitar lá.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="a-label">encontro ou categoria</span>
            <input name="group" list="fin-groups" className="a-input" placeholder="ex.: Harmonização" maxLength={200} autoComplete="off" required />
            <datalist id="fin-groups">
              {names.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <span className="a-help">use o mesmo nome de sempre para somar no mesmo encontro.</span>
          </label>
          <label className="block">
            <span className="a-label">o que foi</span>
            <input name="description" className="a-input" placeholder="ex.: taças, zaffari, ingressos" maxLength={200} autoComplete="off" required />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="a-label">valor (R$)</span>
            <input name="value" inputMode="decimal" className="a-input" placeholder="120,50" required />
          </label>
          <label className="block">
            <span className="a-label">tipo</span>
            <select name="kind" className="a-input" defaultValue="gasto">
              <option value="gasto">gasto</option>
              <option value="receita">receita</option>
            </select>
          </label>
          <label className="block">
            <span className="a-label">forma de pagamento</span>
            <input name="method" list="fin-methods" className="a-input" defaultValue="Pix" maxLength={60} autoComplete="off" />
            <datalist id="fin-methods">
              {["Pix", "Crédito", "Débito", "Dinheiro", "Pix e Crédito"].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>
        </div>
      </section>
    </AdminForm>
  );
}

function RobotStatus() {
  const st = serviceAccountStatus();
  if (st.state === "ok") {
    return (
      <div className="rounded-lg bg-lime/30 p-3 text-sm">
        <p className="font-semibold text-green">conta de serviço configurada ✓</p>
        <p className="mt-1">
          e-mail do robô: <b className="select-all break-all font-mono">{st.email}</b>
        </p>
        <p className="mt-1 text-xs text-muted">compartilhe a planilha com esse e-mail como Editor e cole aqui o link normal da planilha.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-pink/15 p-3 text-sm">
      <p className="font-semibold text-green">conta de serviço: {st.state === "missing" ? "não encontrada" : "com problema"}</p>
      <p className="mt-1 text-xs">
        {st.state === "missing" ? (
          <>
            o site não está vendo a variável <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>. na Vercel, confira se ela está marcada para{" "}
            <b>Production</b> e se você fez o <b>Redeploy</b> depois de criar (variável nova só vale depois de um deploy novo).
          </>
        ) : (
          <>
            a variável <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> existe, mas {st.reason}. depois de corrigir na Vercel, faça o Redeploy.
          </>
        )}
      </p>
    </div>
  );
}

function Setup({ current }: { current: string | null }) {
  const sa = serviceAccountEmail();
  return (
    <section className="a-card space-y-4">
      <h2 className="text-lg font-semibold text-green">{current ? "planilha ligada" : "ligar a planilha"}</h2>
      <RobotStatus />
      {current ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="min-w-0 truncate text-muted">{current}</p>
          <ConfirmButton
            action={clearFinanceSheetAction}
            message="desligar a planilha do painel? ela não é apagada, só para de aparecer aqui."
            className="a-btn !py-1 text-xs text-muted hover:text-[#b23b5a]"
          >
            desligar
          </ConfirmButton>
        </div>
      ) : sa ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>abra a planilha <b>NÓS • Financial Dashboard</b> logada na conta da Nós.</li>
          <li>
            clique em <b>Compartilhar</b>, adicione <b>{sa}</b> como <b>Editor</b> (pode desmarcar &quot;notificar&quot;).
          </li>
          <li>copie o endereço da barra do navegador (termina com /edit…) e cole aqui embaixo.</li>
        </ol>
      ) : (
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>abra a planilha <b>NÓS • Financial Dashboard</b> logada na conta da Nós.</li>
          <li>
            menu <b>Arquivo → Compartilhar → Publicar na Web</b>.
          </li>
          <li>
            em &quot;link&quot;, troque &quot;documento inteiro&quot; pela aba <b>Razão 🧠</b> e &quot;página da Web&quot; por{" "}
            <b>valores separados por vírgula (.csv)</b>. clique em <b>Publicar</b>.
          </li>
          <li>copie o link que aparece e cole aqui embaixo.</li>
        </ol>
      )}
      <AdminForm action={saveFinanceSheetAction} submitLabel={current ? "trocar link" : "ligar planilha"} stickyFooter={false}>
        <label className="block">
          <span className="a-label">link da planilha</span>
          <input name="url" className="a-input" placeholder={sa ? "https://docs.google.com/spreadsheets/d/…/edit" : "https://docs.google.com/spreadsheets/d/e/…/pub?gid=…&output=csv"} autoComplete="off" />
          <span className="a-help">
            {sa ? (
              <>
                a conta de serviço está configurada: cole o <b>link normal</b> da planilha (o da barra de endereço, …/edit) e compartilhe a
                planilha com <b>{sa}</b> como <b>editor</b>. assim dá para lançar e apagar por aqui.
              </>
            ) : (
              <>quem tem o link publicado consegue ver a aba, então não compartilhe ele por aí. para lançar pelo site, veja a conta de serviço em docs/FINANCEIRO.md.</>
            )}
          </span>
        </label>
      </AdminForm>
    </section>
  );
}

export default async function FinanceAdminPage() {
  const [result, current, writable] = await Promise.all([getFinance(), getFinanceSheetUrl(), financeWritable()]);

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="display text-5xl text-green">financeiro</h1>
        <p className="mt-1 text-sm text-muted">
          receita, gastos e lucro por encontro. os gastos (e as receitas fora do site) vêm da aba &quot;Razão&quot; da planilha; as vendas
          de ingressos vêm direto das inscrições pagas aqui do site. atualiza sozinho toda vez que você abre a página.
        </p>
      </header>

      {result.status === "error" && (
        <div className="a-card border-pink bg-pink/15">
          <p className="font-semibold text-green">não consegui ler a planilha</p>
          <p className="mt-1 text-sm">{result.error}</p>
        </div>
      )}

      {result.status === "ok" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="receita total"
              value={brl(result.summary.totals.revenueCents)}
              help={`${brl(result.summary.totals.siteRevenueCents)} pelo site · ${brl(result.summary.totals.sheetRevenueCents)} na planilha`}
            />
            <Stat label="gastos" value={brl(result.summary.totals.expenseCents)} help={`${result.entries} lançamentos na planilha`} />
            <Stat label="lucro" value={brl(result.summary.totals.profitCents)} tone={profitClass(result.summary.totals.profitCents)} />
          </div>

          {writable ? (
            <NewEntry summary={result.summary} />
          ) : (
            <p className="text-xs text-muted">
              para lançar e apagar gastos por aqui (sem abrir a planilha), configure a conta de serviço do Google: passo a passo em
              docs/FINANCEIRO.md. por enquanto, os lançamentos são feitos na planilha.
            </p>
          )}

          <section className="a-card">
            <h2 className="mb-1 text-lg font-semibold text-green">por encontro</h2>
            <p className="mb-4 text-xs text-muted">
              o nome na coluna &quot;Evento/Categoria&quot; da planilha é ligado ao encontro do site com nome parecido (ex.: &quot;Harmonização&quot; →
              &quot;Harmonização de vinhos&quot;). vendas feitas pelo site não precisam ser lançadas na planilha: elas já entram aqui.
            </p>
            {result.summary.rows.length === 0 ? (
              <p className="text-sm text-muted">nenhum encontro com vendas ou lançamentos ainda.</p>
            ) : (
              <Table rows={result.summary.rows} showSite writable={writable} />
            )}
          </section>

          {result.summary.other.length > 0 && (
            <section className="a-card">
              <h2 className="mb-1 text-lg font-semibold text-green">outros gastos</h2>
              <p className="mb-4 text-xs text-muted">categorias da planilha que não são um encontro (investimento, estoque…). entram no total.</p>
              <Table rows={result.summary.other} showSite={false} writable={writable} />
            </section>
          )}
        </>
      )}

      <Setup current={current} />
    </div>
  );
}
