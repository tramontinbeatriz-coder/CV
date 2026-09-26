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
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "vercel-blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, data, { access: "public", contentType: "image/webp" });
    return { url: blob.url, width: info.width, height: info.height };
  }

  const dest = path.join(UPLOAD_DIR, name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, data);
  return { url: `/media/${name}`, width: info.width, height: info.height };
}

export async function deleteImage(url: string) {
  try {
    if (url.startsWith("/media/")) {
      const target = path.resolve(UPLOAD_DIR, url.slice("/media/".length));
      if (target.startsWith(UPLOAD_DIR)) await unlink(target);
    } else if (url.includes(".blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
    // fotos de exemplo (/samples) ficam no projeto e não são apagadas
  } catch (err) {
    console.warn("[storage] não foi possível apagar", url, err);
  }
}
