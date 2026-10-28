import type { Metadata } from "next";
import { PartnershipForm } from "@/components/site/PartnershipForm";
import { getContent } from "@/lib/content";
import { paragraphs } from "@/lib/format";

export const metadata: Metadata = {
  title: "parcerias",
  description: "quer fazer um evento em parceria com a nós? conta a sua ideia.",
};

export default async function PartnershipPage() {
  const c = await getContent();
  return (
    <section className="mx-auto grid max-w-[1400px] gap-14 px-5 pb-24 pt-32 md:grid-cols-12 md:px-10 md:pb-36 md:pt-44">
      <div className="md:col-span-5">
        <p className="label dash dash-pink rise text-green">parcerias</p>
        <h1 className="display rise mt-6 text-[11vw] leading-[0.95] text-green md:text-[4.5rem]" style={{ ["--delay" as string]: "100ms" }}>
          {c.partner_title}
        </h1>
        <div className="rise mt-8 space-y-4 text-lg leading-relaxed text-ink/80" style={{ ["--delay" as string]: "200ms" }}>
          {paragraphs(c.partner_text).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
      <div className="rise md:col-span-6 md:col-start-7" style={{ ["--delay" as string]: "300ms" }}>
        <PartnershipForm />
      </div>
    </section>
  );
}
