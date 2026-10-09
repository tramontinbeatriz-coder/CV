export const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** month: 0–11 → "2026-10-17" */
export function isoDay(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Células de um mês, começando no domingo e completando a última semana.
 * `null` é uma casa vazia antes do dia 1 ou depois do último dia.
 */
export function monthCells(year: number, month: number): (number | null)[] {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.ceil((first + days) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const d = i - first + 1;
    return d >= 1 && d <= days ? d : null;
  });
}

/** Soma (ou subtrai) meses, virando o ano quando precisa. */
export function shiftMonth(year: number, month: number, delta: number) {
  const n = year * 12 + month + delta;
  return { year: Math.floor(n / 12), month: ((n % 12) + 12) % 12 };
}
