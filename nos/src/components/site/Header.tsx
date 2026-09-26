"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Knot, Logo } from "../brand/Logo";

const NAV = [
  { href: "/eventos", label: "encontros" },
  { href: "/sobre", label: "sobre a nós" },
  { href: "/passados", label: "eventos passados" },
];

export function Header({ instagramHandle, instagramHref }: { instagramHandle: string; instagramHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  // No topo da home, o header fica claro sobre a foto
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 300 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          hidden && !open ? "-translate-y-full" : ""
        } ${scrolled && !open ? "bg-cream/90 backdrop-blur-md" : ""} ${overHero ? "text-cream" : open ? "text-cream" : "text-green"}`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
          <Link href="/" aria-label="nós — início" className="group flex items-center gap-2">
            <Logo className="h-8 w-auto transition-transform duration-500 group-hover:-rotate-3 md:h-9" />
            <Knot className="w-3.5 text-pink opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="principal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`label relative py-1 transition-opacity hover:opacity-60 ${
                  pathname.startsWith(item.href) ? "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:bg-current" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a href={instagramHref} target="_blank" rel="noreferrer" className="label transition-opacity hover:opacity-60">
              @{instagramHandle}
            </a>
          </nav>

          <button
            type="button"
            className="label flex items-center gap-2 md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "fechar" : "menu"}
            <Knot className={`w-4 transition-transform duration-500 ${open ? "rotate-90 text-lime" : "text-pink"}`} />
          </button>
        </div>
      </header>

      {/* Menu mobile em tela cheia */}
      <div
        id="menu-mobile"
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-green px-5 pb-10 pt-28 text-cream transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav className="flex flex-col gap-3" aria-label="menu">
          <Link href="/" className="display text-6xl">início</Link>
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="display text-6xl"
              style={{ color: i === 0 ? "var(--lime)" : undefined }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-end justify-between">
          <a href={instagramHref} target="_blank" rel="noreferrer" className="label dash dash-lime">
            @{instagramHandle}
          </a>
          <Knot className="w-12 text-pink wobble" />
        </div>
      </div>
    </>
  );
}
