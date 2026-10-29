import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Armazenamento de fotos.
 * STORAGE_PROVIDER = local (padrão: pasta ./storage/uploads, servida em /media/...)
 *                  | vercel-blob (produção na Vercel: BLOB_READ_WRITE_TOKEN)
 *
 * Toda foto enviada é otimizada: corrige rotação do celular, reduz para no máximo
 * 2000px e converte para WebP — carrega rápido no 4G sem perder qualidade visível.
 */
export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./storage/uploads");
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/avif"];

export type StoredImage = { url: string; width: number; height: number };

export async function saveImage(file: File, folder = "fotos"): Promise<StoredImage> {
  if (!file || file.size === 0) throw new Error("arquivo vazio");
  if (file.size > MAX_BYTES) throw new Error("foto muito grande (máximo 15 MB)");
  if (file.type && !ALLOWED.includes(file.type)) throw new Error("formato não suportado — use JPG, PNG ou WebP");

  const input = Buffer.from(await file.arrayBuffer());
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const name = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
  // Com o Blob da Vercel conectado, usa ele mesmo sem STORAGE_PROVIDER.
  const token = blobToken();
  const provider = process.env.STORAGE_PROVIDER || (token ? "vercel-blob" : "local");

  if (provider === "local" && process.env.VERCEL) {
    throw new Error(
      "as fotos ainda não têm onde ficar guardadas. na Vercel, abra Storage → Blob, conecte ao projeto 'nos' (marcando Production) e faça um Redeploy",
    );
  }

  if (provider === "vercel-blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, data, { access: "public", contentType: "image/webp", token });
    return { url: blob.url, width: info.width, height: info.height };
  }

  const dest = path.join(UPLOAD_DIR, name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, data);
  return { url: `/media/${name}`, width: info.width, height: info.height };
}

/** Token do Blob. Ao conectar o Blob a Vercel pode dar outro prefixo ao nome (ex.: NOS_BLOB_READ_WRITE_TOKEN). */
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find((k) => k.endsWith("BLOB_READ_WRITE_TOKEN") && process.env[k]);
  return key ? process.env[key] : undefined;
}

export async function deleteImage(url: string) {
  try {
    if (url.startsWith("/media/")) {
      const target = path.resolve(UPLOAD_DIR, url.slice("/media/".length));
      if (target.startsWith(UPLOAD_DIR)) await unlink(target);
    } else if (url.includes(".blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(url, { token: blobToken() });
    }
    // fotos de exemplo (/samples) ficam no projeto e não são apagadas
  } catch (err) {
    console.warn("[storage] não foi possível apagar", url, err);
  }
}
