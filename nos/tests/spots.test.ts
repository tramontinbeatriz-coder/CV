import { describe, expect, it } from "vitest";
import { availableSpots, canRegister, effectiveStatus } from "../src/lib/spots";

const base = { totalSpots: 10, spotsTaken: 0, activeHolds: 0, status: "auto" as const, date: "2026-10-17", today: "2026-09-26" };

describe("controle de vagas", () => {
  it("calcula vagas restantes descontando pagas e reservas ativas", () => {
    expect(availableSpots({ totalSpots: 10, spotsTaken: 6, activeHolds: 2 })).toBe(2);
    expect(availableSpots({ totalSpots: 5, spotsTaken: 5, activeHolds: 1 })).toBe(0);
  });

  it("status automático: abertas → últimas vagas → esgotado", () => {
    expect(effectiveStatus(base, 3)).toBe("open");
    expect(effectiveStatus({ ...base, spotsTaken: 7 }, 3)).toBe("last_spots");
    expect(effectiveStatus({ ...base, spotsTaken: 10 }, 3)).toBe("sold_out");
    expect(effectiveStatus({ ...base, spotsTaken: 9, activeHolds: 1 }, 3)).toBe("sold_out");
  });

  it("sem vagas vira esgotado mesmo com status forçado como aberto", () => {
    expect(effectiveStatus({ ...base, status: "open", spotsTaken: 10 }, 3)).toBe("sold_out");
  });

  it("encerrado vence tudo, inclusive data passada", () => {
    expect(effectiveStatus({ ...base, status: "closed" }, 3)).toBe("closed");
    expect(effectiveStatus({ ...base, date: "2026-09-01" }, 3)).toBe("closed");
  });

  it("status forçados pelo painel", () => {
    expect(effectiveStatus({ ...base, status: "sold_out" }, 3)).toBe("sold_out");
    expect(effectiveStatus({ ...base, status: "last_spots" }, 3)).toBe("last_spots");
    expect(effectiveStatus({ ...base, status: "open", spotsTaken: 8 }, 3)).toBe("open");
  });

  it("só permite inscrição em abertas / últimas vagas", () => {
    expect(canRegister("open")).toBe(true);
    expect(canRegister("last_spots")).toBe(true);
    expect(canRegister("sold_out")).toBe(false);
    expect(canRegister("closed")).toBe(false);
  });
});
