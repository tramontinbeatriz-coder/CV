/**
 * Fotos enviadas com STORAGE_PROVIDER=local (/media/...) já são reduzidas e convertidas
 * para WebP no envio, então são servidas direto, sem passar pelo otimizador do Next.
 */
export function isLocalUpload(src?: string | null) {
  return !!src && src.startsWith("/media/");
}
