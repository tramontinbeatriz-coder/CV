import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

/** Serve as fotos enviadas pelo painel quando STORAGE_PROVIDER=local. */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const target = path.resolve(UPLOAD_DIR, ...parts);
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return new Response("não encontrado", { status: 404 });
  try {
    const data = await readFile(target);
    const ext = path.extname(target).toLowerCase();
    const type = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("não encontrado", { status: 404 });
  }
}
