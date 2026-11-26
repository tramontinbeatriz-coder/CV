/**
 * Leitura da planilha financeira da Nós (aba "Razão") e cruzamento com as vendas do site.
 *
 * Só funções puras aqui (sem banco, sem rede), para dar para testar. A busca da planilha
 * fica em src/lib/finance.ts.
 *
 * A aba esperada tem uma linha de cabeçalho com estas colunas (a ordem não importa, e pode
 * haver título/linhas em branco antes dela):
 *   Evento/Categoria | Tipo de Gasto/Receita | Valor | Categoria (Gasto/Receita) | Forma Pgto
 */

export type LedgerEntry = {
  group: string; // "Harmonização", "Investimento", "Estoque"...
  description: string;
  cents: number; // sempre positivo
  kind: "gasto" | "receita";
  method: string;
  row: number; // linha na planilha (1 = primeira), para apagar pelo painel
};

/** Minúsculas, sem acento, só letras/números separados por espaço. */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** "R$ 1.188,45" → 118845 · "-R$ 108,38" → -10838 · "1200.5" → 120050. null se não for número. */
export function parseMoney(input: string | number | null | undefined): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? Math.round(input * 100) : null;
  if (!input) return null;
  const negative = /-|\(/.test(input);
  const clean = input.replace(/[^\d,.]/g, "");
  if (!/\d/.test(clean)) return null;
  let normalized: string;
  if (clean.includes(",")) normalized = clean.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(clean)) normalized = clean.replace(/\./g, ""); // "1.200" = mil e duzentos
  else normalized = clean;
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return null;
  const cents = Math.round(value * 100);
  return negative ? -cents : cents;
}

/** CSV simples (RFC 4180): aspas, vírgulas e quebras de linha dentro de aspas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

type Columns = { group: number; description: number; value: number; kind: number; method: number };

function findHeader(rows: string[][]): { index: number; cols: Columns } | null {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const cells = rows[i].map((c) => normalize(String(c ?? "")));
    const value = cells.findIndex((c) => c === "valor");
    const kind = cells.findIndex((c) => c === "categoria");
    const group = cells.findIndex((c) => c.startsWith("evento"));
    if (value < 0 || group < 0) continue;
    return {
      index: i,
      cols: {
        group,
        value,
        kind,
        description: cells.findIndex((c, j) => j !== group && (c.startsWith("tipo") || c.startsWith("descri"))),
        method: cells.findIndex((c) => c.startsWith("forma")),
      },
    };
  }
  return null;
}

/** Onde ficam as colunas e a linha do cabeçalho (para o painel escrever na planilha). */
export function ledgerLayout(rows: (string | number | null | undefined)[][]) {
  const text = rows.map((r) => r.map((c) => (c == null ? "" : String(c))));
  const header = findHeader(text);
  if (!header) throw new Error("não achei o cabeçalho (colunas \"Evento/Categoria\" e \"Valor\") na planilha");
  const used = Object.values(header.cols).filter((c) => c >= 0);
  // primeira linha livre depois da última linha com algo nas colunas da tabela
  let last = header.index;
  for (let i = header.index + 1; i < text.length; i++) {
    if (used.some((c) => (text[i][c] ?? "").trim() !== "")) last = i;
  }
  return { cols: header.cols, headerRow: header.index + 1, nextRow: last + 2, firstCol: Math.min(...used), lastCol: Math.max(...used) };
}

/** Coluna 0 → "A", 25 → "Z", 26 → "AA". */
export function columnLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * Lê as linhas da aba "Razão" (vindas do CSV publicado ou da API do Google).
 * Linhas sem valor são ignoradas. Categoria "Receita"/"Entrada" = receita; o resto = gasto.
 */
export function parseLedger(rows: (string | number | null | undefined)[][]): LedgerEntry[] {
  const text = rows.map((r) => r.map((c) => (c == null ? "" : String(c))));
  const header = findHeader(text);
  if (!header) throw new Error("não achei o cabeçalho (colunas \"Evento/Categoria\" e \"Valor\") na planilha");
  const { cols } = header;
  const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const out: LedgerEntry[] = [];
  for (let i = header.index + 1; i < text.length; i++) {
    const r = text[i];
    const cents = parseMoney(at(r, cols.value));
    if (cents == null || cents === 0) continue;
    const kindText = normalize(at(r, cols.kind));
    const isRevenue = /^(receita|entrada)/.test(kindText);
    out.push({
      group: at(r, cols.group) || "sem categoria",
      description: at(r, cols.description),
      cents: Math.abs(cents),
      kind: isRevenue ? "receita" : "gasto",
      method: at(r, cols.method),
      row: i + 1,
    });
  }
  return out;
}

export type SiteEvent = { id: string; title: string; slug: string; date: string };

/**
 * Qual encontro do site corresponde ao nome usado na planilha?
 * "Harmonização" casa com "Harmonização de vinhos"; acento e maiúscula não importam.
 * Se mais de um encontro servir, fica o nome exato, senão o mais recente até hoje.
 */
export function matchEvent<T extends SiteEvent>(group: string, siteEvents: T[], today: string): T | null {
  const g = normalize(group);
  if (g.length < 3) return null;
  const words = (s: string) => ` ${s} `;
  const candidates = siteEvents.filter((e) => {
    const t = normalize(e.title);
    const slug = normalize(e.slug);
    return t === g || slug === g || words(t).includes(words(g)) || words(g).includes(words(t));
  });
  if (candidates.length <= 1) return candidates[0] ?? null;
  const exact = candidates.find((e) => normalize(e.title) === g);
  if (exact) return exact;
  const past = candidates.filter((e) => e.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? [...candidates].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export type SiteSales = { eventId: string; paid: number; revenueCents: number };

export type FinanceRow = {
  key: string;
  title: string;
  date: string | null; // data do encontro no site (null = só existe na planilha)
  eventId: string | null;
  sheetNames: string[]; // nomes usados na planilha que caíram aqui
  siteTickets: number;
  siteRevenueCents: number;
  sheetRevenueCents: number;
  expenseCents: number;
  profitCents: number;
  entries: LedgerEntry[];
  /** receita de "ingresso" na planilha E vendas no site: pode estar contado duas vezes */
  maybeDuplicate: boolean;
};

export type FinanceSummary = {
  rows: FinanceRow[]; // encontros (mais recentes primeiro)
  other: FinanceRow[]; // categorias da planilha que não são encontros do site (investimento, estoque...)
  totals: { revenueCents: number; expenseCents: number; profitCents: number; siteRevenueCents: number; sheetRevenueCents: number };
};

/** Nomes da coluna "Evento/Categoria" que não são um encontro. */
const GENERAL_CATEGORY =
  /^(investimentos?|estoque|marketing|divulgacao|geral|gerais|outros?|administrativo|custos? fixos?|fixos?|sem categoria|equipamentos?|materiais)$/;

/** Junta planilha + vendas do site: receita, gastos e lucro por encontro. */
export function buildFinance(
  ledger: LedgerEntry[],
  siteEvents: SiteEvent[],
  sales: SiteSales[],
  today: string,
): FinanceSummary {
  const byKey = new Map<string, FinanceRow>();
  const blank = (key: string, title: string, ev: SiteEvent | null): FinanceRow => ({
    key,
    title,
    date: ev?.date ?? null,
    eventId: ev?.id ?? null,
    sheetNames: [],
    siteTickets: 0,
    siteRevenueCents: 0,
    sheetRevenueCents: 0,
    expenseCents: 0,
    profitCents: 0,
    entries: [],
    maybeDuplicate: false,
  });
  const eventsById = new Map(siteEvents.map((e) => [e.id, e]));

  for (const s of sales) {
    const ev = eventsById.get(s.eventId);
    if (!ev || (s.paid === 0 && s.revenueCents === 0)) continue;
    const row = blank(`e:${ev.id}`, ev.title, ev);
    row.siteTickets = s.paid;
    row.siteRevenueCents = s.revenueCents;
    byKey.set(row.key, row);
  }

  for (const entry of ledger) {
    const ev = matchEvent(entry.group, siteEvents, today);
    const key = ev ? `e:${ev.id}` : `s:${normalize(entry.group)}`;
    let row = byKey.get(key);
    if (!row) {
      row = blank(key, ev?.title ?? entry.group, ev);
      byKey.set(key, row);
    }
    if (!row.sheetNames.includes(entry.group)) row.sheetNames.push(entry.group);
    row.entries.push(entry);
    if (entry.kind === "receita") row.sheetRevenueCents += entry.cents;
    else row.expenseCents += entry.cents;
  }

  const all = [...byKey.values()];
  for (const row of all) {
    row.profitCents = row.siteRevenueCents + row.sheetRevenueCents - row.expenseCents;
    row.maybeDuplicate =
      row.siteRevenueCents > 0 &&
      row.entries.some((e) => e.kind === "receita" && normalize(e.description).includes("ingresso"));
  }

  // encontros do site primeiro (mais recentes no topo), depois os que só existem na planilha;
  // categorias gerais (investimento, estoque...) ficam separadas.
  const isGeneral = (r: FinanceRow) => !r.eventId && r.sheetNames.every((n) => GENERAL_CATEGORY.test(normalize(n)));
  const rows = all
    .filter((r) => !isGeneral(r))
    .sort((a, b) => (b.date ?? "0").localeCompare(a.date ?? "0") || a.title.localeCompare(b.title));
  const other = all.filter(isGeneral).sort((a, b) => b.expenseCents - a.expenseCents);

  const sum = (f: (r: FinanceRow) => number) => all.reduce((acc, r) => acc + f(r), 0);
  const siteRevenueCents = sum((r) => r.siteRevenueCents);
  const sheetRevenueCents = sum((r) => r.sheetRevenueCents);
  const expenseCents = sum((r) => r.expenseCents);
  const revenueCents = siteRevenueCents + sheetRevenueCents;
  return {
    rows,
    other,
    totals: { revenueCents, expenseCents, profitCents: revenueCents - expenseCents, siteRevenueCents, sheetRevenueCents },
  };
}
