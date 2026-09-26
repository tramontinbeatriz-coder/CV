"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { Knot, Logo } from "../brand/Logo";

const ITEMS = [
  { href: "/admin", label: "início", exact: true },
  { href: "/admin/eventos", label: "encontros" },
  { href: "/admin/inscricoes", label: "inscrições" },
  { href: "/admin/galeria", label: "eventos passados & fotos" },
  { href: "/admin/conteudo", label: "textos, contato e cores" },
  { href: "/admin/conta", label: "minha conta" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  return (
    <aside className="sticky top-0 z-30 bg-green text-cream md:h-svh">
      <div className="flex items-center justify-between px-4 py-3 md:block md:px-6 md:py-8">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="h-8 w-auto md:h-10" />
          <span className="text-xs uppercase tracking-[0.2em] text-lime">painel</span>
        </Link>
        <button className="a-btn bg-cream/10 text-cream md:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "fechar" : "menu"}
        </button>
      </div>
      <nav className={`${open ? "block" : "hidden"} px-3 pb-4 md:block md:px-4`} onClick={() => setOpen(false)}>
        <ul className="space-y-1">
          {ITEMS.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active(i.href, i.exact) ? "bg-lime font-semibold text-green" : "hover:bg-cream/10"
                }`}
              >
                {active(i.href, i.exact) && <Knot className="w-3 text-pink" />}
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 space-y-3 border-t border-cream/15 px-3 pt-6 text-xs text-cream/70 md:absolute md:inset-x-4 md:bottom-6">
          <a href="/" target="_blank" className="block hover:text-lime">ver o site ↗</a>
          <p className="truncate">{email}</p>
          <form action={logoutAction}>
            <button className="hover:text-lime">sair</button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
