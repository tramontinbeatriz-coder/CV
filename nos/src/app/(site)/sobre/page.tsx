import type { Metadata } from "next";
import Link from "next/link";
import { Knot, Lockup } from "@/components/brand/Logo";
import { Photo } from "@/components/site/ui";
import { getContent } from "@/lib/content";
import { lines, paragraphs } from "@/lib/format";

export const metadata: Metadata = {
  title: "sobre a nós",
  description: "a nós nasceu para criar espaços onde mulheres possam se encontrar de verdade, em porto alegre.",
};

export default async function AboutPage() {
  const c = await getContent();
  const beliefs = lines(c.beliefs_text);
  const experiences = lines(c.experiences_text).map((l) => {
    const [title, ...rest] = l.split(":");
    return rest.length ? { title: title.trim(), text: rest.join(":").trim() } : { title: l, text: "" };
  });

  return (
    <>
      {/* abertura */}
      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <p className="label dash dash-pink rise text-green">sobre a nós</p>
        <h1 className="display rise mt-6 max-w-5xl text-[14vw] text-green md:text-[8rem]" style={{ ["--delay" as string]: "100ms" }}>
          {c.about_title}
        </h1>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-24 md:grid-cols-12 md:px-10 md:pb-36">
        <div className="reveal md:col-span-5">
          <Photo src={c.about_image_1} alt="" sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5]" />
        </div>
        <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
          <div className="reveal space-y-6 text-xl leading-relaxed md:text-2xl">
            {paragraphs(c.about_lead).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="reveal grid grid-cols-5 items-end gap-4">
            <Photo src={c.about_image_2} alt="" sizes="25vw" className="col-span-3 aspect-[3/4] rotate-2" />
            <Knot className="col-span-2 mb-6 w-20 text-pink wobble" />
          </div>
        </div>
      </section>

      {/* destaque */}
      <section className="relative overflow-hidden bg-green py-24 text-cream md:py-36">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <p className="italic-serif reveal text-3xl leading-[1.2] md:text-6xl">
            <span className="text-lime">“</span>
            {c.about_highlight}
            <span className="text-lime">”</span>
          </p>
          <p className="script reveal mt-10 -rotate-2 text-right text-6xl text-pink md:text-7xl">pode vir sozinha</p>
        </div>
      </section>

      {/* essência + crenças */}
      <section className="mx-auto grid max-w-[1400px] gap-16 px-5 py-24 md:grid-cols-12 md:px-10 md:py-36">
        <div className="md:col-span-5">
          <p className="label dash dash-pink reveal text-green">nossa essência</p>
          <p className="italic-serif reveal mt-8 text-3xl leading-snug text-green md:text-4xl">{c.essence_text}</p>
          <div className="reveal mt-12 hidden md:block">
            <Photo src={c.about_image_3} alt="" sizes="35vw" className="aspect-[4/3] -rotate-1" />
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="label dash dash-pink reveal text-green">o que acreditamos</p>
          <ol className="mt-8">
            {beliefs.map((b, i) => (
              <li key={b} className="reveal flex items-baseline gap-6 border-b border-line py-6" style={{ ["--delay" as string]: `${i * 80}ms` }}>
                <span className="display w-10 shrink-0 text-3xl text-pink">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-3xl text-green md:text-4xl">{b}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* experiências */}
      <section className="bg-mist py-24 md:py-36">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <p className="label dash dash-pink reveal text-green">como são nossas experiências</p>
          <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
            {experiences.map((e, i) => (
              <div key={e.title} className={`reveal ${i % 2 ? "lg:mt-20" : ""}`} style={{ ["--delay" as string]: `${i * 100}ms` }}>
                <Knot className={`w-10 ${["text-pink", "text-green", "text-lime", "text-pink"][i % 4]}`} />
                <h3 className="display mt-5 text-4xl text-green">{e.title}</h3>
                {e.text && <p className="mt-3 text-ink/80">{e.text}</p>}
              </div>
            ))}
          </div>
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
