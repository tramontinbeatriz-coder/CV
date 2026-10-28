import { eq } from "drizzle-orm";
import { db } from "./db";
import { settings } from "./db/schema";

/**
 * Últimos posts do Instagram (@thenos.club) na home.
 *
 * Se INSTAGRAM_ACCESS_TOKEN estiver definido, a home mostra os últimos posts. Aceita os dois
 * tipos de token da Meta: "API do Instagram com login do Instagram" (começa com IG) ou
 * "com login do Facebook" (começa com EAA; a conta precisa estar ligada a uma Página do Facebook). Sem token, a seção usa as fotos
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

/** Registra no log da Vercel por que os posts não vieram (sem mostrar o token). */
async function warn(step: string, res?: Response) {
  const body = res ? (await res.text().catch(() => "")).slice(0, 300) : "";
  console.warn(`[instagram] ${step}${res ? ` → ${res.status}` : ""} ${body}`);
}

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

type RawMedia = { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string };
const MEDIA_FIELDS = "id,media_type,media_url,thumbnail_url,permalink,caption";

function toPosts(data: RawMedia[]): InstagramPost[] {
  return data.map((m) => ({
    id: m.id,
    imageUrl: m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url) : m.media_url,
    permalink: m.permalink,
    caption: m.caption,
  }));
}

/** Tokens do Facebook (começam com "EAA") vêm da "API do Instagram com login do Facebook". */
export function isFacebookToken(token: string) {
  return token.startsWith("EAA");
}

const FB = "https://graph.facebook.com/v21.0";
const KEY_FB_PAGE_TOKEN = "_instagram_fb_page_token";
const KEY_FB_IG_ID = "_instagram_fb_ig_id";

type FbPage = { access_token?: string; instagram_business_account?: { id: string } };

/**
 * Login do Facebook: a conta do Instagram precisa estar ligada a uma Página do Facebook.
 * Com um token de usuário de longa duração, o token da Página que vem de /me/accounts
 * não expira — ele é guardado no banco e usado dali em diante.
 */
async function facebookPosts(envToken: string, limit: number): Promise<InstagramPost[] | null> {
  const [source, savedPageToken, savedIgId] = await Promise.all([
    readSetting(KEY_SOURCE),
    readSetting(KEY_FB_PAGE_TOKEN),
    readSetting(KEY_FB_IG_ID),
  ]);
  let pageToken = source === envToken ? savedPageToken : null;
  let igId = source === envToken ? savedIgId : null;

  if (!pageToken || !igId) {
    const url = new URL(`${FB}/me/accounts`);
    url.searchParams.set("fields", "access_token,instagram_business_account{id}");
    url.searchParams.set("access_token", envToken);
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = (await res.json()) as { data?: FbPage[] };
      const page = json.data?.find((p) => p.instagram_business_account?.id);
      if (!page) await warn(`facebook: o token vê ${json.data?.length ?? 0} Página(s), nenhuma com Instagram ligado`);
      if (page?.instagram_business_account && page.access_token) {
        pageToken = page.access_token;
        igId = page.instagram_business_account.id;
      }
    } else await warn("facebook: /me/accounts", res);
    if (!pageToken || !igId) {
      // Pode ser um token de Página: pergunta a conta do Instagram ligada a ela.
      const me = new URL(`${FB}/me`);
      me.searchParams.set("fields", "instagram_business_account{id}");
      me.searchParams.set("access_token", envToken);
      const r = await fetch(me, { cache: "no-store" });
      if (!r.ok) return (await warn("facebook: /me", r), null);
      const j = (await r.json()) as FbPage;
      if (!j.instagram_business_account) {
        await warn("facebook: nenhuma conta do Instagram ligada a uma Página do Facebook deste token");
        return null;
      }
      pageToken = envToken;
      igId = j.instagram_business_account.id;
    }
    await Promise.all([
      writeSetting(KEY_FB_PAGE_TOKEN, pageToken),
      writeSetting(KEY_FB_IG_ID, igId),
      writeSetting(KEY_SOURCE, envToken),
    ]);
  }

  const url = new URL(`${FB}/${igId}/media`);
  url.searchParams.set("fields", MEDIA_FIELDS);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", pageToken);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return (await warn("facebook: media", res), null);
  const json = (await res.json()) as { data: RawMedia[] };
  return toPosts(json.data);
}

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[] | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!envToken) return null;
  try {
    if (isFacebookToken(envToken)) return await facebookPosts(envToken, limit);
    const current = await currentToken(envToken);
    const token = await refreshIfNeeded(envToken, current.token, current.refreshedAt);

    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.set("fields", MEDIA_FIELDS);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return (await warn("instagram: media", res), null);
    const json = (await res.json()) as { data: RawMedia[] };
    return toPosts(json.data);
  } catch (e) {
    console.warn("[instagram] erro", e instanceof Error ? e.message : e);
    return null;
  }
}
