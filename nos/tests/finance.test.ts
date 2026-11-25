import { describe, expect, it } from "vitest";
import { buildFinance, matchEvent, parseCsv, parseLedger, parseMoney } from "../src/lib/finance-sheet";

// trecho da aba "Razão 🧠" como o Google entrega no CSV publicado
const CSV = `Razão Nós,,,,,,"Todas as receitas e os gastos financeiros da Nós devem ser registradas nesta aba",,,
Evento/Categoria,Tipo de Gasto/Receita,Valor,Categoria,Forma Pgto,,,,,
Meninas Malvadas,fichario,"R$ 31,48",Gasto,Pix,,Total de Despesas 💸,,,
Investimento,patrocinio instagram,"R$ 100,00",Gasto,Pix,,,"R$ 3.576,36",,
Harmonização,ingressos 21x180,"R$ 4.500,00",Receita,Pix e Crédito,,,,,
Harmonização,gastos Marília,"R$ 1.188,45",Gasto,Pix,,,,,
Harmonização,,,,,,,,,
Defesa Pessoal,cafe,"R$ 326,00",Gasto,Pix,,,,,
Defesa Pessoal,ingressos ,"R$ 1.200,00",Receita,Pix,,,,,
Estoque,Bolsas restantes,"R$ 360,00",Gasto,Pix,,,,,
`;

describe("planilha financeira", () => {
  it("lê valores em reais", () => {
    expect(parseMoney("R$ 1.188,45")).toBe(118845);
    expect(parseMoney("-R$ 108,38")).toBe(-10838);
    expect(parseMoney("R$ 0,00")).toBe(0);
    expect(parseMoney("1.200")).toBe(120000);
    expect(parseMoney("1200.5")).toBe(120050);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney(31.48)).toBe(3148);
  });

  it("lê CSV com aspas e quebra de linha", () => {
    expect(parseCsv('a,"b, c","d ""e"""\r\n"x\ny",z')).toEqual([["a", "b, c", 'd "e"'], ["x\ny", "z"]]);
  });

  it("acha o cabeçalho e ignora linhas vazias e o quadro de totais", () => {
    const ledger = parseLedger(parseCsv(CSV));
    expect(ledger).toHaveLength(7);
    expect(ledger[0]).toEqual({ group: "Meninas Malvadas", description: "fichario", cents: 3148, kind: "gasto", method: "Pix" });
    expect(ledger.filter((e) => e.kind === "receita").map((e) => e.cents)).toEqual([450000, 120000]);
  });

  it("reclama se não achar o cabeçalho", () => {
    expect(() => parseLedger([["a", "b"], ["1", "2"]])).toThrow(/cabeçalho/);
  });

  it("liga o nome da planilha ao encontro do site", () => {
    const evs = [
      { id: "1", title: "Harmonização de vinhos", slug: "harmonizacao-de-vinhos", date: "2026-08-20" },
      { id: "2", title: "Defesa pessoal", slug: "defesa-pessoal", date: "2026-10-10" },
      { id: "3", title: "Defesa pessoal", slug: "defesa-pessoal-2", date: "2027-02-10" },
    ];
    expect(matchEvent("Harmonização", evs, "2026-11-25")?.id).toBe("1");
    expect(matchEvent("defesa pessoal", evs, "2026-11-25")?.id).toBe("2"); // o mais recente até hoje
    expect(matchEvent("Investimento", evs, "2026-11-25")).toBeNull();
    expect(matchEvent("Vin", evs, "2026-11-25")).toBeNull(); // pedaço de palavra não conta
  });

  it("soma receita, gastos e lucro por encontro", () => {
    const ledger = parseLedger(parseCsv(CSV));
    const evs = [
      { id: "h", title: "Harmonização de vinhos", slug: "harmonizacao", date: "2026-08-20" },
      { id: "d", title: "Defesa Pessoal", slug: "defesa-pessoal", date: "2026-10-10" },
      { id: "s", title: "Saúde íntima", slug: "saude-intima", date: "2026-11-29" },
    ];
    const sales = [
      { eventId: "s", paid: 10, revenueCents: 90000 },
      { eventId: "d", paid: 0, revenueCents: 0 },
    ];
    const f = buildFinance(ledger, evs, sales, "2026-11-25");

    expect(f.rows.map((r) => r.title)).toEqual(["Saúde íntima", "Defesa Pessoal", "Harmonização de vinhos", "Meninas Malvadas"]);
    const h = f.rows.find((r) => r.eventId === "h")!;
    expect(h.sheetRevenueCents).toBe(450000);
    expect(h.expenseCents).toBe(118845);
    expect(h.profitCents).toBe(331155);
    expect(h.sheetNames).toEqual(["Harmonização"]);
    const s = f.rows.find((r) => r.eventId === "s")!;
    expect(s.siteRevenueCents).toBe(90000);
    expect(s.siteTickets).toBe(10);
    expect(s.maybeDuplicate).toBe(false);

    // "Meninas Malvadas" não existe no site, mas é encontro (aparece como "só na planilha")
    const mm = f.rows.find((r) => r.title === "Meninas Malvadas")!;
    expect(mm.eventId).toBeNull();
    expect(mm.profitCents).toBe(-3148);
    expect(f.other.map((r) => r.title)).toEqual(["Estoque", "Investimento"]);
    expect(f.totals.expenseCents).toBe(3148 + 10000 + 118845 + 32600 + 36000);
    expect(f.totals.revenueCents).toBe(450000 + 120000 + 90000);
    expect(f.totals.profitCents).toBe(f.totals.revenueCents - f.totals.expenseCents);
  });

  it("avisa quando o ingresso pode estar contado duas vezes", () => {
    const ledger = parseLedger(parseCsv(CSV));
    const evs = [{ id: "d", title: "Defesa Pessoal", slug: "defesa-pessoal", date: "2026-10-10" }];
    const f = buildFinance(ledger, evs, [{ eventId: "d", paid: 12, revenueCents: 120000 }], "2026-11-25");
    expect(f.rows.find((r) => r.eventId === "d")!.maybeDuplicate).toBe(true);
  });
});
