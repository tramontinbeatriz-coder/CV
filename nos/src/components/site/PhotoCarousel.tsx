"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Carrossel de fotos: 3 a 4 fotos visíveis no computador (um pouco menos no celular),
 * com setas para passar. No celular também dá para arrastar com o dedo.
 */
export function PhotoCarousel({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const go = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const slide = el.querySelector("li");
    const step = slide ? slide.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="carrossel" role="region" aria-roledescription="carrossel" aria-label={label}>
      <ul ref={track} className="carrossel-trilho">
        {children}
      </ul>
      <div className="carrossel-setas">
        <button type="button" className="carrossel-seta" onClick={() => go(-1)} disabled={atStart} aria-label="fotos anteriores">←</button>
        <button type="button" className="carrossel-seta" onClick={() => go(1)} disabled={atEnd} aria-label="próximas fotos">→</button>
      </div>
    </div>
  );
}
