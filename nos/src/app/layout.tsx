import type { Metadata, Viewport } from "next";
import { getContent } from "@/lib/content";
import { config } from "@/lib/config";
import "./globals.css";

// Todo conteúdo vem do banco/painel: sempre renderizado na hora, com as edições mais recentes.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    metadataBase: new URL(config.siteUrl),
    title: { default: c.seo_title, template: "%s — nós" },
    description: c.seo_description,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "nós",
      title: c.seo_title,
      description: c.seo_description,
    },
    twitter: { card: "summary_large_image", title: c.seo_title, description: c.seo_description },
  };
}

export const viewport: Viewport = {
  themeColor: "#235c4c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  // Paleta editável pelo painel → variáveis CSS
  const palette = `:root{--green:${c.color_green};--cream:${c.color_cream};--lime:${c.color_lime};--pink:${c.color_pink};--mist:${c.color_mist};--ink:${c.color_ink};}`;
  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{ __html: palette.replace(/</g, "") }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
