import { asc, desc, eq, and } from "drizzle-orm";
import { db } from "./db";
import { pastEvents, photos, type PastEvent, type Photo } from "./db/schema";

export type PastEventWithPhotos = PastEvent & { photos: Photo[] };

export async function getPublishedPastEvents(): Promise<PastEventWithPhotos[]> {
  const list = await db.select().from(pastEvents).where(eq(pastEvents.published, true)).orderBy(desc(pastEvents.date));
  return attachPhotos(list);
}

export async function getAllPastEventsForAdmin() {
  const list = await db.select().from(pastEvents).orderBy(desc(pastEvents.date));
  return attachPhotos(list);
}

async function attachPhotos(list: PastEvent[]) {
  if (list.length === 0) return [];
  const all = await db.select().from(photos).orderBy(asc(photos.sortOrder), asc(photos.createdAt));
  return list.map((pe) => ({ ...pe, photos: all.filter((p) => p.pastEventId === pe.id) }));
}

export async function getPastEventById(id: string) {
  const [pe] = await db.select().from(pastEvents).where(eq(pastEvents.id, id)).limit(1);
  if (!pe) return null;
  const [withPhotos] = await attachPhotos([pe]);
  return withPhotos;
}

/** Fotos marcadas como destaque (seção "nós em fotos" da home). */
export async function getFeaturedPhotos(limit = 8) {
  const rows = await db
    .select({ photo: photos, pastEvent: pastEvents })
    .from(photos)
    .innerJoin(pastEvents, eq(pastEvents.id, photos.pastEventId))
    .where(and(eq(photos.featured, true), eq(pastEvents.published, true)))
    .orderBy(desc(pastEvents.date), asc(photos.sortOrder))
    .limit(limit);
  return rows.map((r) => ({ ...r.photo, eventTitle: r.pastEvent.title }));
}
