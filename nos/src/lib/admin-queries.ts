import "server-only";
import { and, desc, eq, gt, like, lte, or, isNull, type SQL } from "drizzle-orm";
import { db } from "./db";
import { events, registrations, waitlistEntries } from "./db/schema";

export type RegistrationFilters = { eventId?: string; status?: string; q?: string };

/** Lista inscrições para o painel/CSV. status "expired" = pendente com reserva vencida. */
export async function listRegistrations(f: RegistrationFilters) {
  const now = new Date().toISOString();
  const where: SQL[] = [];
  if (f.eventId) where.push(eq(registrations.eventId, f.eventId));
  if (f.status === "expired") {
    where.push(eq(registrations.paymentStatus, "pending"));
    where.push(or(isNull(registrations.holdExpiresAt), lte(registrations.holdExpiresAt, now))!);
  } else if (f.status === "pending") {
    where.push(eq(registrations.paymentStatus, "pending"));
    where.push(gt(registrations.holdExpiresAt, now));
  } else if (f.status) {
    where.push(eq(registrations.paymentStatus, f.status as "paid"));
  }
  if (f.q) {
    const term = `%${f.q.toLowerCase()}%`;
    where.push(or(like(registrations.name, term), like(registrations.email, term), like(registrations.phone, term))!);
  }
  return db
    .select({ r: registrations, eventTitle: events.title, eventDate: events.date })
    .from(registrations)
    .innerJoin(events, eq(events.id, registrations.eventId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(registrations.createdAt));
}

export async function listWaitlist(eventId?: string) {
  return db
    .select({ w: waitlistEntries, eventTitle: events.title })
    .from(waitlistEntries)
    .innerJoin(events, eq(events.id, waitlistEntries.eventId))
    .where(eventId ? eq(waitlistEntries.eventId, eventId) : undefined)
    .orderBy(desc(waitlistEntries.createdAt));
}

export function toCsv(rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita fórmulas maliciosas no Excel
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM para acentos abrirem certo no Excel
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}
