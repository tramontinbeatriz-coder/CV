import type { Registration } from "@/lib/db/schema";
import type { EventView } from "@/lib/events";
import { STATUS_LABEL, type EffectiveStatus } from "@/lib/spots";

export const PAYMENT_LABEL: Record<string, string> = {
  pending: "aguardando pagamento",
  paid: "pago ✓",
  failed: "recusado",
  cancelled: "cancelado",
  refunded: "reembolsado",
  expired: "reserva expirou",
};

/** Pendentes com reserva vencida aparecem como "reserva expirou". */
export function paymentDisplay(r: Pick<Registration, "paymentStatus" | "holdExpiresAt">) {
  if (r.paymentStatus === "pending" && (!r.holdExpiresAt || r.holdExpiresAt < new Date().toISOString())) return "expired";
  return r.paymentStatus;
}

export function PaymentPill({ registration }: { registration: Pick<Registration, "paymentStatus" | "holdExpiresAt" | "overbooked"> }) {
  const s = paymentDisplay(registration);
  const color: Record<string, string> = {
    paid: "bg-lime text-green",
    pending: "bg-[#fff3c4] text-[#6b5400]",
    expired: "bg-mist text-muted",
    failed: "bg-[#fbe9ee] text-[#9d2748]",
    cancelled: "bg-mist text-muted",
    refunded: "bg-mist text-muted",
  };
  return (
    <span className="inline-flex flex-wrap gap-1">
      <span className={`a-pill ${color[s]}`}>{PAYMENT_LABEL[s]}</span>
      {registration.overbooked && <span className="a-pill bg-pink text-green" title="pagou depois que a reserva expirou e o evento já estava cheio">acima do limite</span>}
    </span>
  );
}

export function StatusPill({ status, published = true }: { status: EffectiveStatus; published?: boolean }) {
  if (!published) return <span className="a-pill bg-mist text-muted">rascunho (fora do site)</span>;
  const color: Record<EffectiveStatus, string> = {
    open: "bg-lime text-green",
    last_spots: "bg-pink text-green",
    sold_out: "bg-green text-cream",
    closed: "bg-mist text-muted",
  };
  return <span className={`a-pill ${color[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function SpotsBar({ event }: { event: EventView }) {
  const pct = event.totalSpots ? Math.min(100, (event.spotsTaken / event.totalSpots) * 100) : 0;
  const holdPct = event.totalSpots ? Math.min(100 - pct, (event.activeHolds / event.totalSpots) * 100) : 0;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-mist">
        <div className="bg-green" style={{ width: `${pct}%` }} />
        <div className="bg-pink" style={{ width: `${holdPct}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">
        {event.spotsTaken} pagas{event.activeHolds ? ` · ${event.activeHolds} pagando agora` : ""} · {event.available} livres de {event.totalSpots}
      </p>
    </div>
  );
}

export function Field({ label, help, children, className }: { label: string; help?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="a-label">{label}</span>
      {children}
      {help && <span className="a-help">{help}</span>}
    </label>
  );
}

export function Flash({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <div className="a-card border-lime bg-lime/30 !py-3 text-sm font-medium text-green">{children}</div>;
}
