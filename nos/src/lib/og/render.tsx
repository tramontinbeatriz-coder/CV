import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/brand/logo-paths";

export const OG_SIZE = { width: 1200, height: 630 };

async function font(pkg: string, file: string) {
  return readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), "node_modules/@fontsource", pkg, "files", file));
}

/** Imagem de compartilhamento (WhatsApp/Instagram) no visual da nós. */
export async function renderOg({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  const [italic, sanchez] = await Promise.all([
    font("playfair-display", "playfair-display-latin-400-italic.woff"),
    font("sanchez", "sanchez-latin-400-normal.woff"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#235c4c", color: "#f1f1e5", padding: 64 }}>
        <div style={{ display: "flex", fontFamily: "Sanchez", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#dded91" }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Playfair", fontSize: title.length > 40 ? 58 : 72, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ display: "flex", fontFamily: "Sanchez", fontSize: 28, marginTop: 20, color: "#e18fa6" }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: 70, height: 2, background: "#dded91", marginBottom: 44, marginRight: -18 }} />
            <svg viewBox={LOGO_VIEWBOX} width={290} height={160} fill="#f1f1e5">
              {LOGO_PATHS.map((p, i) => (
                <path key={i} transform={p.transform} d={p.d} />
              ))}
            </svg>
          </div>
          <div style={{ display: "flex", fontFamily: "Sanchez", fontSize: 20, letterSpacing: 5, textTransform: "uppercase", opacity: 0.8 }}>@thenos.club</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Playfair", data: italic, style: "italic", weight: 400 },
        { name: "Sanchez", data: sanchez, style: "normal", weight: 400 },
      ],
    },
  );
}
