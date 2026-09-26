import { instagramUrl } from "@/lib/content";
import { getFeaturedPhotos } from "@/lib/gallery";
import { getInstagramPosts } from "@/lib/instagram";
import { Knot } from "../brand/Logo";
import { Photo } from "./ui";

/** Chamada para o Instagram. Mostra posts reais se INSTAGRAM_ACCESS_TOKEN existir; senão, fotos da galeria. */
export async function InstagramSection({ handle, title }: { handle: string; title: string }) {
  const href = instagramUrl(handle);
  const posts = await getInstagramPosts(6);
  const tiles =
    posts?.map((p) => ({ id: p.id, src: p.imageUrl, href: p.permalink, alt: p.caption?.slice(0, 80) ?? "" })) ??
    (await getFeaturedPhotos(6)).map((p) => ({ id: p.id, src: p.url, href, alt: p.alt ?? "" }));

  return (
    <section className="relative overflow-hidden bg-cream py-24 text-green md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="label dash dash-pink reveal mb-6">instagram</p>
            <a href={href} target="_blank" rel="noreferrer" className="reveal group inline-block">
              <span className="display block text-[13vw] leading-[0.95] transition-colors duration-500 group-hover:text-pink md:text-[7vw] lg:text-[7rem]">
                {handleParts(handle)}
              </span>
            </a>
          </div>
          <div className="reveal md:col-span-4">
            <p className="italic-serif text-2xl leading-snug md:text-3xl">{title}</p>
            <a href={href} target="_blank" rel="noreferrer" className="btn btn-green mt-8">
              seguir a nós <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        {tiles.length > 0 && (
          <div className="mt-16 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {tiles.map((t, i) => (
              <a
                key={t.id}
                href={t.href}
                target="_blank"
                rel="noreferrer"
                className={`reveal photo-zoom group relative block ${i % 2 ? "md:translate-y-8" : ""}`}
                style={{ ["--delay" as string]: `${i * 70}ms` }}
              >
                <Photo src={t.src} alt={t.alt} sizes="(min-width: 768px) 16vw, 33vw" className="aspect-square" />
                <span className="absolute inset-0 grid place-items-center bg-green/0 transition-colors duration-500 group-hover:bg-green/40">
                  <Knot className="w-8 text-lime opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Permite quebrar a linha depois do ponto no celular: @thenos.<wbr>club */
function handleParts(handle: string) {
  const [first, ...rest] = handle.split(".");
  return (
    <>
      @{first}
      {rest.map((r, i) => (
        <span key={i}>
          .<wbr />
          {r}
        </span>
      ))}
    </>
  );
}
