import type { EventView } from "@/lib/events";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";
import { SpotsLine } from "./ui";

/** Ficha técnica do encontro (data, horário, local, duração, valor, vagas). */
export function EventFacts({ event }: { event: EventView }) {
  const rows: [string, React.ReactNode][] = [
    ["data", formatLongDate(event.date)],
    ["horário", formatTime(event.time)],
    [
      "local",
      <>
        {event.locationName || "a definir"}
        {event.address && <span className="block text-muted">{event.address}</span>}
        {event.mapsUrl && (
          <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="link mt-1 inline-block text-sm">
            abrir no mapa ↗
          </a>
        )}
      </>,
    ],
    ...(event.duration ? ([["duração", event.duration]] as [string, React.ReactNode][]) : []),
    ["valor", formatPrice(event.priceCents)],
    ["vagas", <SpotsLine key="v" event={event} />],
  ];
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4">
          <dt className="label pt-1 text-muted">{k}</dt>
          <dd className="text-green">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

