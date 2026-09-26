import { describe, expect, it } from "vitest";
import { formatDayMonth, formatLongDate, formatPrice, formatTime, lines, parsePriceToCents, slugify } from "../src/lib/format";

describe("formatação", () => {
  it("datas em português", () => {
    expect(formatDayMonth("2026-10-17")).toBe("17 de outubro");
    expect(formatLongDate("2026-10-17")).toBe("sábado, 17 de outubro");
  });
  it("horário no estilo 09h / 19h30", () => {
    expect(formatTime("09:00")).toBe("09h");
    expect(formatTime("19:30")).toBe("19h30");
  });
  it("preço em reais e leitura do campo do painel", () => {
    expect(formatPrice(9000)).toMatch(/R\$\s?90,00/);
    expect(formatPrice(0)).toBe("gratuito");
    expect(parsePriceToCents("90,00")).toBe(9000);
    expect(parsePriceToCents("R$ 1.250,50")).toBe(125050);
    expect(parsePriceToCents("120")).toBe(12000);
    expect(parsePriceToCents("")).toBe(0);
  });
  it("slug amigável", () => {
    expect(slugify("Defesa Pessoal com Fran!")).toBe("defesa-pessoal-com-fran");
    expect(slugify("Café & Conversa")).toBe("cafe-conversa");
  });
  it("listas de um item por linha", () => {
    expect(lines("- água\n\n• frutas\n  toalha ")).toEqual(["água", "frutas", "toalha"]);
  });
});
