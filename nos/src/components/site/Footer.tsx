import Link from "next/link";
import { instagramUrl, isPlaceholder, type Content } from "@/lib/content";
import { Knot, Logo } from "../brand/Logo";

export function Footer({ content: c }: { content: Content }) {
  const ig = instagramUrl(c.instagram_handle);
  const whatsappDigits = c.contact_whatsapp.replace(/\D/g, "");
  return (
    <footer className="relative overflow-hidden bg-green text-cream">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-20 md:px-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="italic-serif text-3xl leading-tight text-lime md:text-5xl">
              chega mais.
              <br />
              <span className="text-cream">o próximo encontro pode ser o seu.</span>
            </p>
            <Link href="/eventos" className="btn btn-lime mt-10">
              ver próximos encontros <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-5">
            <div>
              <p className="label mb-4 text-lime">navegue</p>
              <ul className="space-y-2 text-sm">
                <li><Link className="link" href="/eventos">encontros</Link></li>
                <li><Link className="link" href="/sobre">sobre a nós</Link></li>
                <li><Link className="link" href="/passados">eventos passados</Link></li>
                <li><Link className="link" href="/privacidade">política de privacidade</Link></li>
              </ul>
            </div>
            <div>
              <p className="label mb-4 text-lime">fale com a gente</p>
              <ul className="space-y-2 text-sm break-words">
                <li>
                  <a className="link" href={ig} target="_blank" rel="noreferrer">
                    @{c.instagram_handle}
                  </a>
                </li>
                {!isPlaceholder(c.contact_email) ? (
                  <li><a className="link" href={`mailto:${c.contact_email}`}>{c.contact_email}</a></li>
                ) : (
                  <li className="opacity-60">{c.contact_email}</li>
                )}
                {!isPlaceholder(c.contact_whatsapp) ? (
                  <li>
                    <a className="link" href={`https://wa.me/55${whatsappDigits}`} target="_blank" rel="noreferrer">
                      whatsapp {c.contact_whatsapp}
                    </a>
                  </li>
                ) : (
                  <li className="opacity-60">{c.contact_whatsapp}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between gap-6 md:mt-28">
          <div className="flex items-end">
            <span aria-hidden className="mb-[3.2vw] mr-[-1vw] hidden h-px w-[8vw] bg-lime md:block" />
            <Logo className="h-[26vw] w-auto max-h-72 text-cream md:h-[18vw]" />
            <Knot className="mb-2 ml-1 w-[5vw] max-w-14 text-pink wobble" />
          </div>
          <p className="label hidden max-w-48 text-right text-cream/70 md:block">{c.contact_note}</p>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-cream/20 pt-6 text-xs text-cream/60 md:flex-row">
          <p>© {new Date().getFullYear()} nós · porto alegre</p>
          <p className="md:hidden">{c.contact_note}</p>
        </div>
      </div>
    </footer>
  );
}
