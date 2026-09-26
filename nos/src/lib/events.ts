import { and, asc, desc, eq, gt, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "./db";
import { events, photos, registrations, type Event } from "./db/schema";
import { config } from "./config";
import { todayISO } from "./format";
import { availableSpots, effectiveStatus, type EffectiveStatus } from "./spots";

export type EventView = Event & {
  activeHolds: number;
  available: number;
  effective: EffectiveStatus;
};

type Executor = Pick<typeof db, "select">;

export async function activeHoldsByEvent(eventIds: string[], exec: Executor = db) {
  if (eventIds.length === 0) return new Map<string, number>();
  const rows = await exec
    .select({ eventId: registrations.eventId, count: sql<number>`count(*)` })
    .from(registrations)
    .where(
      and(
        inArray(registrations.eventId, eventIds),
        eq(registrations.paymentStatus, "pending"),
        gt(registrations.holdExpiresAt, new Date().toISOString()),
      ),
    )
    .groupBy(registrations.eventId);
  return new Map(rows.map((r) => [r.eventId, Number(r.count)]));
}

export function toView(event: Event, activeHolds: number): EventView {
  const input = {
    totalSpots: event.totalSpots,
    spotsTaken: event.spotsTaken,
    activeHolds,
  };
  return {
    ...event,
    activeHolds,
    available: availableSpots(input),
    effective: effectiveStatus(
      { ...input, status: event.status, date: event.date, today: todayISO() },
      config.lastSpotsThreshold,
    ),
  };
}

async function withViews(list: Event[]) {
  const holds = await activeHoldsByEvent(list.map((e) => e.id));
  return list.map((e) => toView(e, holds.get(e.id) ?? 0));
}

/** Próximos encontros publicados (hoje em diante). */
export async function getUpcomingEvents(limit?: number) {
  const q = db
    .select()
    .from(events)
    .where(and(eq(events.published, true), gte(events.date, todayISO())))
    .orderBy(asc(events.date), asc(events.time));
  const list = limit ? await q.limit(limit) : await q;
  return withViews(list);
}

export async function getEventBySlug(slug: string, { includeDrafts = false } = {}) {
  const [event] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  if (!event || (!event.published && !includeDrafts)) return null;
  const [view] = await withViews([event]);
  return view;
}

export async function getEventById(id: string) {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return null;
  const [view] = await withViews([event]);
  return view;
}

export async function getAllEventsForAdmin() {
  const list = await db.select().from(events).orderBy(desc(events.date));
  return withViews(list);
}

export async function getEventPhotos(eventId: string) {
  return db
    .select()
    .from(photos)
    .where(eq(photos.eventId, eventId))
    .orderBy(asc(photos.sortOrder), asc(photos.createdAt));
}

/** Eventos já realizados que ainda não viraram galeria (usado no painel). */
export async function getPastPublishedEvents() {
  return db
    .select()
    .from(events)
    .where(and(eq(events.published, true), lt(events.date, todayISO())))
    .orderBy(desc(events.date));
}
