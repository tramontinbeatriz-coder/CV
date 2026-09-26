import type { EventStatusSetting } from "./db/schema";

export type EffectiveStatus = "open" | "last_spots" | "sold_out" | "closed";

export const STATUS_LABEL: Record<EffectiveStatus, string> = {
  open: "inscrições abertas",
  last_spots: "últimas vagas",
  sold_out: "esgotado",
  closed: "encerrado",
};

export const STATUS_SETTING_LABEL: Record<EventStatusSetting, string> = {
  auto: "automático (pelas vagas)",
  open: "inscrições abertas",
  last_spots: "últimas vagas",
  sold_out: "esgotado",
  closed: "encerrado",
};

export type SpotInput = {
  totalSpots: number;
  spotsTaken: number;
  /** reservas ativas (pagamentos pendentes dentro do prazo) */
  activeHolds: number;
};

export function availableSpots({ totalSpots, spotsTaken, activeHolds }: SpotInput) {
  return Math.max(0, totalSpots - spotsTaken - activeHolds);
}

/**
 * Status exibido no site.
 * - "encerrado" vence tudo (forçado no painel ou data já passou)
 * - sem vagas sempre vira "esgotado", mesmo com status forçado como aberto
 * - "auto" vira "últimas vagas" quando restam poucas
 */
export function effectiveStatus(
  input: SpotInput & { status: EventStatusSetting; date: string; today: string },
  lastSpotsThreshold: number,
): EffectiveStatus {
  if (input.status === "closed" || input.date < input.today) return "closed";
  const available = availableSpots(input);
  if (input.status === "sold_out" || available <= 0) return "sold_out";
  if (input.status === "last_spots") return "last_spots";
  if (input.status === "auto" && available <= lastSpotsThreshold) return "last_spots";
  return "open";
}

export function canRegister(status: EffectiveStatus) {
  return status === "open" || status === "last_spots";
}
