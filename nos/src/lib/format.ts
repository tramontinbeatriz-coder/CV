export const TIMEZONE = "America/Sao_Paulo";

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "17 de outubro" */
export function formatDayMonth(date: string) {
  const { m, d } = parts(date);
  return `${d} de ${MONTHS[m - 1]}`;
}

/** "sábado, 17 de outubro" */
export function formatLongDate(date: string) {
  const { weekday } = parts(date);
  return `${WEEKDAYS[weekday]}, ${formatDayMonth(date)}`;
}

/** "17.10" */
export function formatShortDate(date: string) {
  const { m, d } = parts(date);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

/** "agosto 2026" */
export function formatMonthYear(date: string) {
  const { y, m } = parts(date);
  return `${MONTHS[m - 1]} ${y}`;
}

export function weekdayOf(date: string) {
  return WEEKDAYS[parts(date).weekday];
}

/** "09:00" → "09h", "19:30" → "19h30" */
export function formatTime(time: string) {
  const [h, min] = time.split(":");
  return min === "00" ? `${h}h` : `${h}h${min}`;
}

export function formatPrice(cents: number) {
  if (cents === 0) return "gratuito";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Data de hoje (YYYY-MM-DD) no fuso de Porto Alegre. */
export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(now);
}

/** Converte "R$ 120,00" / "120" / "120.5" em centavos. */
export function parsePriceToCents(input: string) {
  const clean = input.replace(/[^\d,.-]/g, "");
  if (!clean) return 0;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Linhas não vazias de um campo de texto "um item por linha". */
export function lines(text?: string | null) {
  return (text ?? "")
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/** Parágrafos separados por linha em branco. */
export function paragraphs(text?: string | null) {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
