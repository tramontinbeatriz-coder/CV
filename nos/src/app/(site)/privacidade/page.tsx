import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { paragraphs } from "@/lib/format";

export const metadata: Metadata = { title: "política de privacidade" };

export default async function PrivacyPage() {
  const c = await getContent();
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-44">
      <p className="label dash dash-pink text-green">legal</p>
      <h1 className="display mt-6 text-6xl text-green md:text-7xl">política de privacidade</h1>
      <div className="mt-12 space-y-5 text-lg leading-relaxed">
        {paragraphs(c.privacy_text).map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
      <div className="mt-16 border-t border-line pt-8">
        <p className="label mb-4 text-green">cancelamento</p>
        <p className="whitespace-pre-line">{c.cancellation_text}</p>
      </div>
    </section>
  );
}
