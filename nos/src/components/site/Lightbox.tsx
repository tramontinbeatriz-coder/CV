"use client";

import Image from "next/image";
import { isLocalUpload } from "@/lib/images";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxPhoto = { id: string; url: string; alt: string; width?: number | null; height?: number | null };

/** Galeria masonry (fotos de tamanhos diferentes) + lightbox com teclado e gesto de arrastar. */
export function Lightbox({ photos, columns = "columns-2 md:columns-3" }: { photos: LightboxPhoto[]; columns?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const current = index !== null ? photos[index] : null;

  return (
    <>
      <div className={`${columns} gap-3 md:gap-5`}>
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className="reveal photo-zoom group relative mb-3 block w-full cursor-zoom-in overflow-hidden md:mb-5"
            style={{ ["--delay" as string]: `${(i % 3) * 90}ms` }}
            aria-label={`ampliar foto ${i + 1}`}
          >
            <Image unoptimized={isLocalUpload(p.url)}
              src={p.url}
              alt={p.alt}
              width={p.width ?? 1200}
              height={p.height ?? 1500}
              sizes="(min-width: 768px) 33vw, 50vw"
              quality={70}
              className="h-auto w-full bg-mist"
            />
            <span className="absolute inset-0 bg-green/0 transition-colors duration-500 group-hover:bg-green/15" />
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="foto ampliada"
          className="fixed inset-0 z-[80] flex flex-col bg-green/97 text-cream"
          style={{ animation: "rise .4s var(--ease-soft)" }}
          onClick={() => setIndex(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 md:px-10">
            <span className="label">
              {index! + 1} / {photos.length}
            </span>
            <button type="button" className="label hover:text-lime" onClick={() => setIndex(null)}>
              fechar ✕
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image unoptimized={isLocalUpload(current.url)} key={current.id} src={current.url} alt={current.alt} fill sizes="100vw" quality={80} className="object-contain p-2 md:p-8" style={{ animation: "rise .5s var(--ease-soft)" }} />
          </div>
          <div className="flex items-center justify-between px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn btn-outline" onClick={() => go(-1)} aria-label="foto anterior">
              ←
            </button>
            <p className="italic-serif hidden text-lg md:block">{current.alt}</p>
            <button type="button" className="btn btn-outline" onClick={() => go(1)} aria-label="próxima foto">
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
