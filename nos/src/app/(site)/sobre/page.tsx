import type { Metadata } from "next";
import Link from "next/link";
import { Knot, Lockup } from "@/components/brand/Logo";
import { Photo } from "@/components/site/ui";
import { getContent } from "@/lib/content";
import { paragraphs } from "@/lib/format";

export const metadata: Metadata = {
  title: "sobre a nós",
  description: "a nós nasceu para criar espaços onde mulheres possam se encontrar de verdade, em porto alegre.",
};

export default async function AboutPage() {
  const c = await getContent();

  return (
    <>
      {/* abertura */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <p className="label dash dash-pink rise text-green">sobre a nós</p>
        <h1 className="display rise mt-6 max-w-5xl text-[9vw] text-green md:text-[5.5rem]" style={{ ["--delay" as string]: "100ms" }}>
          {c.about_title}
        </h1>
      </section>

      {/* história: dividida ao meio como na home — foto até a margem à esquerda, texto à direita */}
      <section className="sobre-split sobre-pagina">
        <div className="sobre-foto">
          <Photo src={c.about_image_1} alt="as fundadoras da nós" sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full" />
        </div>
        <div className="sobre-texto">
          <div className="reveal historia">
            {paragraphs(c.about_lead).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Knot className="reveal w-16 text-pink wobble" />
        </div>
      </section>

      {/* destaque */}
      <section className="relative overflow-hidden bg-green py-24 text-cream md:py-36">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <p className="italic-serif reveal text-2xl leading-[1.3] md:text-4xl">
            <span className="text-lime">“</span>
            {c.about_highlight}
            <span className="text-lime">”</span>
          </p>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1400px] flex-col items-start gap-10 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-10 md:py-32">
        <h2 className="text-[26vw] leading-none text-green md:text-[12rem]">
          <Lockup entre entreClass="text-pink" dashClass="text-pink" knotClass="text-lime" />
          <span className="sr-only">entre nós</span>
        </h2>
        <Link href="/eventos" className="btn btn-green">
          ver próximos encontros →
        </Link>
      </section>
    </>
  );
}
