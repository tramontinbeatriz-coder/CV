/**
 * Gera as imagens de EXEMPLO em public/samples (tons neutros + granulado de filme,
 * com a etiqueta "foto de exemplo"). Servem só para visualizar o layout até as
 * fotos reais serem enviadas pelo painel.
 *   npx tsx scripts/generate-samples.ts
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const palettes = [
  ["#d9dcc6", "#235c4c", "#e18fa6", "#f1f1e5"],
  ["#e7e3cf", "#dded91", "#235c4c", "#f1f1e5"],
  ["#ecdcd6", "#e18fa6", "#6f8d6a", "#f1f1e5"],
  ["#c8d3c0", "#235c4c", "#dded91", "#efeee0"],
  ["#e9e2d4", "#b98a73", "#235c4c", "#f1f1e5"],
  ["#dfe4d0", "#e18fa6", "#dded91", "#f4f2e6"],
];

const sizes: [number, number][] = [
  [1800, 1200], [1200, 1500], [1400, 1400], [1200, 1600], [1800, 1200], [1200, 1500],
  [1500, 1000], [1200, 1500], [1400, 1400], [1600, 1200], [1200, 1600], [1400, 1750],
  [1800, 1200], [1200, 1500],
];

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function svg(i: number, w: number, h: number) {
  const r = rand(i * 97 + 13);
  const [bg, a, b, c] = palettes[i % palettes.length];
  const blobs = [a, b, c, a]
    .map((color, k) => {
      const cx = Math.round(r() * w);
      const cy = Math.round((0.3 + r() * 0.7) * h);
      const rx = Math.round((0.18 + r() * 0.35) * w);
      const ry = Math.round((0.15 + r() * 0.35) * h);
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${0.55 + k * 0.1}" filter="url(#blur)"/>`;
    })
    .join("");
  const n = String(i + 1).padStart(2, "0");
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${Math.round(w / 14)}"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${i}"/><feColorMatrix type="saturate" values="0"/></filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.35"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  ${blobs}
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.3"/>
  <rect width="100%" height="100%" fill="url(#vig)"/>
  <text x="${Math.round(w * 0.05)}" y="${Math.round(h - w * 0.05)}" font-family="monospace" font-size="${Math.round(w / 45)}" fill="#f5ede1" opacity="0.85" letter-spacing="2">foto de exemplo · nº ${n}</text>
</svg>`;
}

async function main() {
  await mkdir("public/samples", { recursive: true });
  for (let i = 0; i < sizes.length; i++) {
    const [w, h] = sizes[i];
    const file = `public/samples/amostra-${String(i + 1).padStart(2, "0")}.jpg`;
    await sharp(Buffer.from(svg(i, w, h))).jpeg({ quality: 72, mozjpeg: true }).toFile(file);
    console.log("✓", file);
  }
}

main();
