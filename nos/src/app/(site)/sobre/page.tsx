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

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 md:grid-cols-12 md:px-10 md:pb-36">
        <div className="reveal md:col-span-5">
          <Photo src={c.about_image_1} alt="" sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5]" />
        </div>
        <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
          <div className="reveal historia">
            {paragraphs(c.about_lead).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Knot className="reveal w-20 text-pink wobble" />
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
