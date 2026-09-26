export const dynamic = "force-dynamic";

import { getContent } from "@/lib/content";
import { OG_SIZE, renderOg } from "@/lib/og/render";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "nós — experiências para encontrar, conversar e estar";

export default async function Image() {
  const c = await getContent();
  return renderOg({ kicker: "encontros para mulheres · porto alegre", title: c.hero_title });
}
