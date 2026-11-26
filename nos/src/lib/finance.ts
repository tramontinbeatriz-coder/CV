import "server-only";
import { eq, sql } from "drizzle-orm";
import { SignJWT, importPKCS8 } from "jose";
import { db } from "./db";
import { events, registrations, settings } from "./db/schema";
import { todayISO } from "./format";
import { buildFinance, columnLetter, ledgerLayout, normalize, parseCsv, parseLedger, type FinanceSummary } from "./finance-sheet";

/**
 * Painel financeiro (admin → financeiro): lê a aba "Razão" da planilha "NÓS • Financial Dashboard"
 * no Google Sheets e cruza com as inscrições pagas do site.
 *
 * O link da planilha é colado no próprio painel (fica na tabela settings). Dois jeitos de ler:
 *  1. link "Publicar na Web" em CSV (…/pub?…output=csv): o site baixa direto. Mais simples.
 *  2. link normal da planilha (…/spreadsheets/d/<id>/edit) + conta de serviço do Google em
 *     GOOGLE_SERVICE_ACCOUNT_JSON (a planilha é compartilhada com o e-mail dessa conta como editora).
 *     Mais privado, sem atraso, e o painel também consegue lançar e apagar linhas na aba Razão.
 * Passo a passo para os dois em docs/FINANCEIRO.md.
 */

export const FINANCE_SHEET_KEY = "finance_sheet_url";

export async function getFinanceSheetUrl() {
  const [row] = await db.select().from(settings).where(eq(settings.key, FINANCE_SHEET_KEY)).limit(1);
  return row?.value || process.env.FINANCE_SHEET_URL || null;
}

/** Aceita só links do Google Sheets (o site não busca nenhum outro endereço). */
export function checkSheetUrl(raw: string): { url: string; kind: "csv" | "sheet"; id?: string } | { error: string } {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return { error: "isso não parece um link. copie o endereço inteiro, começando com https://" };
  }
  if (u.protocol !== "https:" || u.hostname !== "docs.google.com" || !u.pathname.startsWith("/spreadsheets/")) {
    return { error: "o link precisa ser de uma planilha do Google (docs.google.com/spreadsheets/…)" };
  }
  if (u.pathname.startsWith("/spreadsheets/d/e/")) {
    if (u.searchParams.get("output") !== "csv") {
      return { error: "na hora de publicar, escolha a aba \"Razão\" e o formato \"valores separados por vírgula (.csv)\"" };
    }
    return { url: u.toString(), kind: "csv" };
  }
  const id = u.pathname.match(/^\/spreadsheets\/d\/([\w-]+)/)?.[1];
  if (!id) return { error: "não reconheci esse link de planilha" };
  return { url: u.toString(), kind: "sheet", id };
}

function serviceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!json.client_email || !json.private_key) return null;
    return { email: json.client_email, key: json.private_key.replace(/\\n/g, "\n") };
  } catch {
    return null;
  }
}

export function serviceAccountEmail() {
  return serviceAccount()?.email ?? null;
}

async function googleToken(sa: { email: string; key: string }) {
  const key = await importPKCS8(sa.key, "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/spreadsheets" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`o Google recusou a conta de serviço (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

type SheetContext = { id: string; tab: string; auth: RequestInit };

async function sheetContext(id: string): Promise<SheetContext> {
  const sa = serviceAccount();
  if (!sa) {
    throw new Error(
      "esse é o link normal da planilha. para o site conseguir ler, use o link de \"Publicar na Web\" em CSV, ou configure a conta de serviço (docs/FINANCEIRO.md)",
    );
  }
  const token = await googleToken(sa);
  const auth: RequestInit = { headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, cache: "no-store" };
  const meta = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties.title`, auth);
  if (meta.status === 403 || meta.status === 404) {
    throw new Error(`a planilha não está compartilhada com ${sa.email}. compartilhe com esse e-mail como editor`);
  }
  if (!meta.ok) throw new Error(`não consegui abrir a planilha (${meta.status})`);
  const titles = ((await meta.json()) as { sheets: { properties: { title: string } }[] }).sheets.map((s) => s.properties.title);
  const tab = titles.find((t) => normalize(t).startsWith("razao")) ?? titles[0];
  return { id, tab, auth };
}

const rangeOf = (ctx: SheetContext, a1: string) => encodeURIComponent(`'${ctx.tab.replace(/'/g, "''")}'!${a1}`);
const valuesUrl = (ctx: SheetContext, a1: string) => `https://sheets.googleapis.com/v4/spreadsheets/${ctx.id}/values/${rangeOf(ctx, a1)}`;

async function readTab(ctx: SheetContext): Promise<string[][]> {
  const res = await fetch(valuesUrl(ctx, "A1:Z"), ctx.auth);
  if (!res.ok) throw new Error(`não consegui ler a aba "${ctx.tab}" (${res.status})`);
  return ((await res.json()) as { values?: string[][] }).values ?? [];
}

async function fetchRowsWithServiceAccount(id: string): Promise<string[][]> {
  return readTab(await sheetContext(id));
}

/** O painel pode lançar na planilha? (link normal + conta de serviço) */
export async function financeWritable() {
  const url = await getFinanceSheetUrl();
  const checked = url ? checkSheetUrl(url) : null;
  return !!checked && !("error" in checked) && checked.kind === "sheet" && !!serviceAccount();
}

async function writableContext() {
  const url = await getFinanceSheetUrl();
  const checked = url ? checkSheetUrl(url) : null;
  if (!checked || "error" in checked || checked.kind !== "sheet") {
    throw new Error("para lançar pelo site, ligue o link normal da planilha (não o publicado) com a conta de serviço configurada");
  }
  return sheetContext(checked.id!);
}

export type NewLedgerEntry = { group: string; description: string; cents: number; kind: "gasto" | "receita"; method: string };

/** Escreve um lançamento na primeira linha livre da aba Razão. */
export async function addLedgerEntry(entry: NewLedgerEntry) {
  const ctx = await writableContext();
  const layout = ledgerLayout(await readTab(ctx));
  const { cols, nextRow, firstCol, lastCol } = layout;
  const line: (string | number)[] = Array.from({ length: lastCol - firstCol + 1 }, () => "");
  const put = (col: number, v: string | number) => {
    if (col >= 0) line[col - firstCol] = v;
  };
  put(cols.group, entry.group);
  put(cols.description, entry.description);
  put(cols.value, entry.cents / 100);
  put(cols.kind, entry.kind === "receita" ? "Receita" : "Gasto");
  put(cols.method, entry.method);
  const a1 = `${columnLetter(firstCol)}${nextRow}:${columnLetter(lastCol)}${nextRow}`;
  const res = await fetch(`${valuesUrl(ctx, a1)}?valueInputOption=USER_ENTERED`, {
    ...ctx.auth,
    method: "PUT",
    body: JSON.stringify({ values: [line] }),
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("a conta de serviço só pode ver a planilha. compartilhe com ela como editor");
    throw new Error(`o Google não aceitou o lançamento (${res.status})`);
  }
  return nextRow;
}

/**
 * Apaga (deixa em branco) um lançamento. Antes confere se a linha ainda é a mesma que
 * apareceu na tela, para não apagar outra coisa se alguém mexeu na planilha no meio-tempo.
 */
export async function clearLedgerEntry(row: number, expected: { group: string; description: string; cents: number }) {
  const ctx = await writableContext();
  const rows = await readTab(ctx);
  const layout = ledgerLayout(rows);
  if (row <= layout.headerRow) throw new Error("linha inválida");
  const current = parseLedger(rows).find((e) => e.row === row);
  if (!current || current.group !== expected.group || current.description !== expected.description || current.cents !== expected.cents) {
    throw new Error("essa linha mudou na planilha desde que a página abriu. recarregue e tente de novo");
  }
  const a1 = `${columnLetter(layout.firstCol)}${row}:${columnLetter(layout.lastCol)}${row}`;
  const res = await fetch(`${valuesUrl(ctx, a1)}:clear`, { ...ctx.auth, method: "POST", body: "{}" });
  if (!res.ok) throw new Error(`o Google não deixou apagar (${res.status})`);
}

async function fetchRowsFromCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { cache: "no-store", redirect: "follow" });
  if (!res.ok) throw new Error(`o Google não entregou a planilha (${res.status}). confira se ela continua publicada`);
  const text = await res.text();
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("o link não devolveu um CSV. publique a aba \"Razão\" no formato .csv");
  return parseCsv(text);
}

export type FinanceResult =
  | { status: "not-configured" }
  | { status: "error"; error: string }
  | { status: "ok"; summary: FinanceSummary; entries: number };

export async function getFinance(): Promise<FinanceResult> {
  const url = await getFinanceSheetUrl();
  if (!url) return { status: "not-configured" };
  const checked = checkSheetUrl(url);
  if ("error" in checked) return { status: "error", error: checked.error };

  try {
    const [rows, siteEvents, sales] = await Promise.all([
      checked.kind === "csv" ? fetchRowsFromCsv(checked.url) : fetchRowsWithServiceAccount(checked.id!),
      db.select({ id: events.id, title: events.title, slug: events.slug, date: events.date }).from(events),
      db
        .select({
          eventId: registrations.eventId,
          paid: sql<number>`count(*)`,
          revenueCents: sql<number>`coalesce(sum(${registrations.amountCents}), 0)`,
        })
        .from(registrations)
        .where(eq(registrations.paymentStatus, "paid"))
        .groupBy(registrations.eventId),
    ]);
    const ledger = parseLedger(rows);
    const summary = buildFinance(
      ledger,
      siteEvents,
      sales.map((s) => ({ eventId: s.eventId, paid: Number(s.paid), revenueCents: Number(s.revenueCents) })),
      todayISO(),
    );
    return { status: "ok", summary, entries: ledger.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[financeiro] ${message}`);
    return { status: "error", error: message };
  }
}
