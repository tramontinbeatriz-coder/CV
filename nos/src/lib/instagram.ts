/**
 * Integração futura (opcional) com o Instagram.
 * Se INSTAGRAM_ACCESS_TOKEN estiver definido (Instagram API com login do Instagram,
 * conta profissional), a home mostra os últimos posts de @thenos.club.
 * Sem token, a seção usa as fotos em destaque da galeria — nada quebra.
 */
export type InstagramPost = { id: string; imageUrl: string; permalink: string; caption?: string };

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
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
