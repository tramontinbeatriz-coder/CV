"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, like, max, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { changePassword, login, logout, requireAdmin } from "@/lib/auth";
import { CONTENT_FIELDS, type ContentKey } from "@/lib/content";
import { db } from "@/lib/db";
import { EVENT_STATUSES, PAYMENT_STATUSES, events, pastEvents, photos, registrations, settings, waitlistEntries } from "@/lib/db/schema";
import { parsePriceToCents, slugify } from "@/lib/format";
import { setPaymentStatus } from "@/lib/registrations";
import { deleteImage, saveImage } from "@/lib/storage";

export type ActionState = { ok?: boolean; error?: string; message?: string };

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const optional = (fd: FormData, key: string) => str(fd, key) || null;
const file = (fd: FormData, key: string) => {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
};

function refreshSite() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ login
export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const result = await login(str(fd, "email"), str(fd, "password"), ip);
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const next = str(fd, "next");
  if (next.length < 10) return { error: "a nova senha precisa ter pelo menos 10 caracteres." };
  if (next !== str(fd, "confirm")) return { error: "as senhas novas não conferem." };
  const r = await changePassword(session.sub, str(fd, "current"), next);
  return r.ok ? { ok: true, message: "senha alterada ✓" } : { error: r.error };
}

// ---------------------------------------------------------------- eventos
const eventSchema = z.object({
  title: z.string().min(2, "dê um nome ao encontro"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "escolha a data"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "escolha o horário"),
  totalSpots: z.coerce.number().int().min(0, "número de vagas inválido").max(10000),
  status: z.enum(EVENT_STATUSES),
});

async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base) || "encontro";
  let candidate = root;
  for (let n = 2; ; n++) {
    const [hit] = await db
      .select({ id: events.id })
      .from(events)
      .where(ignoreId ? and(eq(events.slug, candidate), ne(events.id, ignoreId)) : eq(events.slug, candidate))
      .limit(1);
    if (!hit) return candidate;
    candidate = `${root}-${n}`;
  }
}

export async function saveEventAction(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = eventSchema.safeParse({
    title: str(fd, "title"),
    date: str(fd, "date"),
    time: str(fd, "time"),
    totalSpots: str(fd, "totalSpots") || "0",
    status: str(fd, "status") || "auto",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const slug = await uniqueSlug(str(fd, "slug") || parsed.data.title, id ?? undefined);
  const values = {
    ...parsed.data,
    slug,
    tagline: optional(fd, "tagline"),
    summary: optional(fd, "summary"),
    description: optional(fd, "description"),
    duration: optional(fd, "duration"),
    locationName: optional(fd, "locationName"),
    address: optional(fd, "address"),
    city: optional(fd, "city"),
    mapsUrl: optional(fd, "mapsUrl"),
    priceCents: parsePriceToCents(str(fd, "price")),
    published: fd.get("published") === "on",
    isSample: fd.get("isSample") === "on",
    coverAlt: optional(fd, "coverAlt"),
    included: optional(fd, "included"),
    importantInfo: optional(fd, "importantInfo"),
    updatedAt: new Date().toISOString(),
  };

  const cover = file(fd, "cover");
  let coverImage: string | undefined;
  if (cover) {
    try {
      coverImage = (await saveImage(cover, "capas")).url;
    } catch (e) {
      return { error: `foto de capa: ${(e as Error).message}` };
    }
  }

  let eventId = id;
  if (id) {
    const [current] = await db.select().from(events).where(eq(events.id, id));
    if (!current) return { error: "encontro não encontrado" };
    if (values.totalSpots < current.spotsTaken) {
      return { error: `já existem ${current.spotsTaken} inscrições pagas — o total de vagas não pode ser menor que isso.` };
    }
    await db.update(events).set({ ...values, ...(coverImage ? { coverImage } : {}) }).where(eq(events.id, id));
    if (coverImage && current.coverImage) await deleteImage(current.coverImage);
  } else {
    const [created] = await db.insert(events).values({ ...values, coverImage: coverImage ?? null }).returning();
    eventId = created.id;
  }
  refreshSite();
  if (!id) redirect(`/admin/eventos/${eventId}?criado=1`);
  return { ok: true, message: "alterações salvas ✓" };
}

export async function duplicateEventAction(id: string) {
  await requireAdmin();
  const [e] = await db.select().from(events).where(eq(events.id, id));
  if (!e) return;
  const slug = await uniqueSlug(`${e.slug}-copia`);
  const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = e;
  const [copy] = await db
    .insert(events)
    .values({ ...rest, title: `${e.title} (cópia)`, slug, spotsTaken: 0, published: false })
    .returning();
  redirect(`/admin/eventos/${copy.id}?duplicado=1`);
}

export async function deleteEventAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const [paid] = await db
    .select({ n: sql<number>`count(*)` })
    .from(registrations)
    .where(and(eq(registrations.eventId, id), eq(registrations.paymentStatus, "paid")));
  if (Number(paid?.n) > 0) {
    return { error: "este encontro tem inscrições pagas. para tirar do site, desmarque “publicado” ou mude o status para “encerrado”." };
  }
  const [e] = await db.select().from(events).where(eq(events.id, id));
  const eventPhotos = await db.select().from(photos).where(eq(photos.eventId, id));
  await db.delete(registrations).where(eq(registrations.eventId, id));
  await db.delete(waitlistEntries).where(eq(waitlistEntries.eventId, id));
  await db.delete(photos).where(eq(photos.eventId, id));
  await db.delete(events).where(eq(events.id, id));
  await Promise.all([...eventPhotos.map((p) => deleteImage(p.url)), e?.coverImage ? deleteImage(e.coverImage) : null]);
  refreshSite();
  redirect("/admin/eventos?excluido=1");
}

/** Cria uma galeria em "eventos passados" a partir de um encontro que já aconteceu. */
export async function eventToGalleryAction(id: string) {
  await requireAdmin();
  const [e] = await db.select().from(events).where(eq(events.id, id));
  if (!e) return;
  let slug = slugify(`${e.title}-${e.date.slice(0, 7)}`);
  const [exists] = await db.select({ id: pastEvents.id }).from(pastEvents).where(eq(pastEvents.slug, slug));
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;
  const [pe] = await db
    .insert(pastEvents)
    .values({ title: e.title, slug, date: e.date, location: e.locationName, description: e.tagline ?? e.summary, published: false })
    .returning();
  const eventPhotos = await db.select().from(photos).where(eq(photos.eventId, id));
  const toCopy = [...(e.coverImage ? [{ url: e.coverImage, alt: e.coverAlt, width: null, height: null }] : []), ...eventPhotos];
  if (toCopy.length) {
    await db.insert(photos).values(
      toCopy.map((p, i) => ({ url: p.url, alt: p.alt, width: p.width, height: p.height, pastEventId: pe.id, sortOrder: i })),
    );
  }
  redirect(`/admin/galeria/${pe.id}?criado=1`);
}

// ------------------------------------------------------------------ fotos
/** Envia UMA foto (o navegador já reduziu o tamanho). owner = "event:<id>" | "past:<id>" */
export async function uploadPhotoAction(owner: string, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const f = file(fd, "photo");
  if (!f) return { error: "nenhuma foto enviada" };
  const [kind, ownerId] = owner.split(":");
  const column = kind === "event" ? photos.eventId : photos.pastEventId;
  try {
    const stored = await saveImage(f, kind === "event" ? "eventos" : "galeria");
    const [last] = await db.select({ m: max(photos.sortOrder) }).from(photos).where(eq(column, ownerId));
    await db.insert(photos).values({
      url: stored.url,
      width: stored.width,
      height: stored.height,
      alt: optional(fd, "alt"),
      sortOrder: (last?.m ?? -1) + 1,
      ...(kind === "event" ? { eventId: ownerId } : { pastEventId: ownerId }),
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  refreshSite();
  return { ok: true };
}

export async function updatePhotoAction(photoId: string, fd: FormData) {
  await requireAdmin();
  await db
    .update(photos)
    .set({ alt: optional(fd, "alt"), featured: fd.get("featured") === "on" })
    .where(eq(photos.id, photoId));
  refreshSite();
}

export async function togglePhotoFeaturedAction(photoId: string) {
  await requireAdmin();
  await db.update(photos).set({ featured: sql`not ${photos.featured}` }).where(eq(photos.id, photoId));
  refreshSite();
}

export async function movePhotoAction(photoId: string, direction: -1 | 1) {
  await requireAdmin();
  const [p] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!p) return;
  const siblings = await db
    .select()
    .from(photos)
    .where(p.eventId ? eq(photos.eventId, p.eventId) : eq(photos.pastEventId, p.pastEventId!))
    .orderBy(photos.sortOrder, photos.createdAt);
  const i = siblings.findIndex((s) => s.id === p.id);
  const j = i + direction;
  if (j < 0 || j >= siblings.length) return;
  [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
  for (const [k, s] of siblings.entries()) {
    await db.update(photos).set({ sortOrder: k }).where(eq(photos.id, s.id));
  }
  refreshSite();
}

export async function deletePhotoAction(photoId: string) {
  await requireAdmin();
  const [p] = await db.select().from(photos).where(eq(photos.id, photoId));
  if (!p) return;
  await db.delete(photos).where(eq(photos.id, photoId));
  // só apaga o arquivo se nenhuma outra foto/capa usa a mesma imagem
  const [other] = await db.select({ id: photos.id }).from(photos).where(eq(photos.url, p.url)).limit(1);
  const [cover] = await db.select({ id: events.id }).from(events).where(eq(events.coverImage, p.url)).limit(1);
  if (!other && !cover) await deleteImage(p.url);
  refreshSite();
}

// -------------------------------------------------------- eventos passados
export async function savePastEventAction(id: string | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = str(fd, "title");
  const date = str(fd, "date");
  if (title.length < 2) return { error: "dê um nome ao encontro" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "escolha a data" };
  let slug = slugify(str(fd, "slug") || `${title}-${date.slice(0, 7)}`);
  const [clash] = await db.select({ id: pastEvents.id }).from(pastEvents).where(eq(pastEvents.slug, slug));
  if (clash && clash.id !== id) slug = `${slug}-${Date.now().toString(36)}`;
  const values = {
    title,
    date,
    slug,
    location: optional(fd, "location"),
    description: optional(fd, "description"),
    published: fd.get("published") === "on",
    isSample: fd.get("isSample") === "on",
  };
  if (id) {
    await db.update(pastEvents).set(values).where(eq(pastEvents.id, id));
    refreshSite();
    return { ok: true, message: "alterações salvas ✓" };
  }
  const [created] = await db.insert(pastEvents).values(values).returning();
  refreshSite();
  redirect(`/admin/galeria/${created.id}?criado=1`);
}

export async function deletePastEventAction(id: string) {
  await requireAdmin();
  const list = await db.select().from(photos).where(eq(photos.pastEventId, id));
  await db.delete(photos).where(eq(photos.pastEventId, id));
  await db.delete(pastEvents).where(eq(pastEvents.id, id));
  for (const p of list) {
    const [other] = await db.select({ id: photos.id }).from(photos).where(eq(photos.url, p.url)).limit(1);
    const [cover] = await db.select({ id: events.id }).from(events).where(eq(events.coverImage, p.url)).limit(1);
    if (!other && !cover) await deleteImage(p.url);
  }
  refreshSite();
  redirect("/admin/galeria?excluido=1");
}

// -------------------------------------------------------------- inscrições
export async function setRegistrationStatusAction(registrationId: string, fd: FormData) {
  await requireAdmin();
  const status = z.enum(PAYMENT_STATUSES).parse(str(fd, "status"));
  await setPaymentStatus(registrationId, status);
  refreshSite();
}

export async function deleteWaitlistEntryAction(entryId: string) {
  await requireAdmin();
  await db.delete(waitlistEntries).where(eq(waitlistEntries.id, entryId));
  revalidatePath("/admin/inscricoes");
}

// ---------------------------------------------------------------- conteúdo
export async function saveContentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const keys = Object.keys(CONTENT_FIELDS) as ContentKey[];
  const now = new Date().toISOString();
  for (const key of keys) {
    const field = CONTENT_FIELDS[key];
    let value: string | null = null;
    if (field.type === "image") {
      const upload = file(fd, `${key}__file`);
      if (upload) {
        try {
          value = (await saveImage(upload, "site")).url;
        } catch (e) {
          return { error: `${field.label}: ${(e as Error).message}` };
        }
      } else if (fd.has(key)) {
        value = str(fd, key);
      }
    } else if (fd.has(key)) {
      value = typeof fd.get(key) === "string" ? String(fd.get(key)).replace(/\r\n/g, "\n").trim() : null;
    }
    if (value === null) continue;
    if (field.type === "color" && !/^#[0-9a-f]{6}$/i.test(value)) continue;
    await db
      .insert(settings)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } });
  }
  refreshSite();
  return { ok: true, message: "conteúdo salvo ✓ — já está no ar." };
}

export async function resetContentKeysAction(prefix: string) {
  await requireAdmin();
  await db.delete(settings).where(like(settings.key, `${prefix}%`));
  refreshSite();
}
