import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RevealObserver } from "@/components/site/RevealObserver";
import { getContent, instagramUrl } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  return (
    <div className="grain flex min-h-svh flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-lime focus:p-3">
        pular para o conteúdo
      </a>
      <Header instagramHandle={content.instagram_handle} instagramHref={instagramUrl(content.instagram_handle)} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer content={content} />
      <RevealObserver />
    </div>
  );
}
