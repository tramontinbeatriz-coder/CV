import { describe, expect, it } from "vitest";
import { isoDay, monthCells, shiftMonth } from "@/lib/calendar";

describe("monthCells", () => {
  it("começa no domingo e fecha a última semana", () => {
    // outubro de 2026 começa numa quinta
    const cells = monthCells(2026, 9);
    expect(cells.slice(0, 5)).toEqual([null, null, null, null, 1]);
    expect(cells.length % 7).toBe(0);
    expect(cells.filter(Boolean)).toHaveLength(31);
  });

  it("não cria semana vazia quando o mês fecha no sábado", () => {
    // fevereiro de 2026: domingo 1 a sábado 28
    expect(monthCells(2026, 1)).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("vira o ano nos dois sentidos", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});

describe("isoDay", () => {
  it("formata com zeros", () => {
    expect(isoDay(2026, 9, 7)).toBe("2026-10-07");
  });
});
