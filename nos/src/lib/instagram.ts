import { eq } from "drizzle-orm";
import { db } from "./db";
import { settings } from "./db/schema";

/**
 * Últimos posts do Instagram (@thenos.club) na home.
 *
 * Se INSTAGRAM_ACCESS_TOKEN estiver definido (Instagram API com login do Instagram,
 * conta profissional), a home mostra os últimos posts. Sem token, a seção usa as fotos
 * em destaque da galeria — nada quebra.
 *
 * O token de longa duração vale 60 dias. O site renova sozinho a cada 7 dias e guarda o
 * token novo no banco (tabela settings), então não é preciso trocar a variável de ambiente.
 * A variável só é usada da primeira vez (ou se for trocada por um token diferente).
 */
export type InstagramPost = { id: string; imageUrl: string; permalink: string; caption?: string };

const KEY_TOKEN = "_instagram_token";
const KEY_SOURCE = "_instagram_token_source"; // qual token do .env originou o salvo
const KEY_REFRESHED = "_instagram_token_refreshed_at";
const REFRESH_EVERY_MS = 7 * 24 * 60 * 60 * 1000;

async function readSetting(key: string) {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return row?.value ?? null;
}

async function writeSetting(key: string, value: string) {
  const now = new Date().toISOString();
  await db.insert(settings).values({ key, value, updatedAt: now }).onConflictDoUpdate({
    target: settings.key,
    set: { value, updatedAt: now },
  });
}

/** Token atual: o renovado no banco, ou o do .env se ele mudou desde a última renovação. */
async function currentToken(envToken: string) {
  const [saved, source, refreshedAt] = await Promise.all([readSetting(KEY_TOKEN), readSetting(KEY_SOURCE), readSetting(KEY_REFRESHED)]);
  if (saved && source === envToken) return { token: saved, refreshedAt: refreshedAt ? Date.parse(refreshedAt) : 0 };
  return { token: envToken, refreshedAt: 0 };
}

async function refreshIfNeeded(envToken: string, token: string, refreshedAt: number) {
  if (Date.now() - refreshedAt < REFRESH_EVERY_MS) return token;
  try {
    const url = new URL("https://graph.instagram.com/refresh_access_token");
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return token;
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) return token;
    await Promise.all([
      writeSetting(KEY_TOKEN, json.access_token),
      writeSetting(KEY_SOURCE, envToken),
      writeSetting(KEY_REFRESHED, new Date().toISOString()),
    ]);
    return json.access_token;
  } catch {
    return token;
  }
}

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[] | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!envToken) return null;
  try {
    const current = await currentToken(envToken);
    const token = await refreshIfNeeded(envToken, current.token, current.refreshedAt);

    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set("fields", "id,media_type,media_url,thumbnail_url,permalink,caption");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data: { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string }[];
    };
    return json.data.map((m) => ({
      id: m.id,
      imageUrl: m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url) : m.media_url,
      permalink: m.permalink,
      caption: m.caption,
    }));
  } catch {
    return null;
  }
}
