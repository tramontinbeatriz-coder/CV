"use client";

import Link from "next/link";
import { useState } from "react";
import { Knot } from "@/components/brand/Logo";
import { MONTH_NAMES, isoDay, monthCells, shiftMonth } from "@/lib/calendar";
import { formatShortDate, formatTime, weekdayOf } from "@/lib/format";

export type CalendarEvent = { slug: string; title: string; date: string; time: string };

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/**
 * Seção "próximos eventos": calendário do mês com os dias de encontro em lima.
 * Clicar no dia abre a página do evento; "comprar ingresso" vai direto pro formulário dela.
 */
export function EventCalendar({
  id,
  events,
  today,
  title = "próximos eventos",
  className = "",
}: {
  id: string;
  /** só eventos futuros, em ordem de data */
  events: CalendarEvent[];
  /** YYYY-MM-DD no fuso de Porto Alegre, vindo do servidor para não divergir na hidratação */
  today: string;
  /** primeira palavra em Sanchez, o resto em Playfair itálico */
  title?: string;
  className?: string;
}) {
  const start = events[0]?.date ?? today;
  const [view, setView] = useState({ year: Number(start.slice(0, 4)), month: Number(start.slice(5, 7)) - 1 });
  const todayYear = Number(today.slice(0, 4));
  const atFirstMonth = view.year * 12 + view.month <= todayYear * 12 + Number(today.slice(5, 7)) - 1;

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);

  const monthKey = isoDay(view.year, view.month, 1).slice(0, 7);
  const inMonth = events.filter((e) => e.date.startsWith(monthKey));
  // ingresso: primeiro evento do mês; se o mês estiver vazio, o próximo depois dele
  const ticket = inMonth[0] ?? events.find((e) => e.date > monthKey);
  const monthName = MONTH_NAMES[view.month];
  const [titleTop, ...titleRest] = title.trim().split(/\s+/);

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`cal-sec ${className}`}>
      <div className="cal-wrap">
        <div className="cal-title">
          <Knot className="cal-rabisco" />
          <h2 id={`${id}-titulo`}>
            <span className="cal-t1">{titleTop}</span>
            {titleRest.length > 0 && <span className="cal-t2">{titleRest.join(" ")}</span>}
          </h2>
        </div>

        <div className="cal">
          <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="mês anterior" disabled={atFirstMonth} onClick={() => setView(shiftMonth(view.year, view.month, -1))}>
              &lt;
            </button>
            <p className="cal-mes" aria-live="polite" aria-label={`${monthName} de ${view.year}`}>
              {monthName}
              {view.year !== todayYear && <small>{view.year}</small>}
            </p>
            <button type="button" className="cal-nav" aria-label="próximo mês" onClick={() => setView(shiftMonth(view.year, view.month, 1))}>
              &gt;
            </button>
          </div>

          <div className="cal-dow" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="cal-grid">
            {monthCells(view.year, view.month).map((day, i) => {
              if (day === null) return <span key={`v${i}`} className="cal-dia cal-dia--vazio" aria-hidden />;
              const key = isoDay(view.year, view.month, day);
              const evs = byDay.get(key);
              const todayCls = key === today ? " cal-dia--hoje" : "";
              if (!evs) {
                return (
                  <span key={key} className={`cal-dia${todayCls}`}>
                    {day}
                  </span>
                );
              }
              const names = evs.map((e) => e.title).join(" + ");
              return (
                <Link
                  key={key}
                  href={`/eventos/${evs[0].slug}`}
                  className={`cal-dia cal-dia--evento${todayCls}`}
                  title={`${names} · ${formatTime(evs[0].time)}`}
                  aria-label={`${day} de ${monthName}: ${names}, ver evento`}
                >
                  {day}
                </Link>
              );
            })}
          </div>

          <ul className="cal-lista">
            {inMonth.length > 0 ? (
              inMonth.map((e) => (
                <li key={e.slug}>
                  <Link href={`/eventos/${e.slug}`}>
                    <b>{formatShortDate(e.date)}</b>
                    {e.title} · {weekdayOf(e.date)}, {formatTime(e.time)}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <span>{events.length ? "nenhum encontro neste mês, por enquanto." : "os próximos encontros estão sendo preparados."}</span>
              </li>
            )}
          </ul>

          {ticket && (
            <Link href={`/eventos/${ticket.slug}#inscricao`} className="cal-cta" title={ticket.title}>
              comprar ingresso
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
