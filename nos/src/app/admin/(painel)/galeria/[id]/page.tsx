import Link from "next/link";
import { notFound } from "next/navigation";
import { getPastEventById } from "@/lib/gallery";
import { PastEventForm } from "@/components/admin/PastEventForm";
import { ConfirmButton, PhotoManager } from "@/components/admin/client";
import { Flash } from "@/components/admin/ui";
import { deletePastEventAction, deletePhotoAction, movePhotoAction, togglePhotoFeaturedAction, updatePhotoAction, uploadPhotoAction } from "@/app/admin/actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ criado?: string }> };

export default async function EditGallery({ params, searchParams }: Props) {
  const [{ id }, { criado }] = await Promise.all([params, searchParams]);
  const pe = await getPastEventById(id);
  if (!pe) notFound();
  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/admin/galeria" className="text-sm underline">← eventos passados</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl text-green">{pe.title}</h1>
        <div className="flex gap-2">
          <a href={`/passados#${pe.slug}`} target="_blank" className="a-btn a-btn-soft">ver no site ↗</a>
          <ConfirmButton action={deletePastEventAction.bind(null, pe.id)} message="excluir esta galeria e todas as fotos dela?">excluir galeria</ConfirmButton>
        </div>
      </header>
      <Flash show={!!criado}>galeria criada ✓ — agora adicione as fotos abaixo.</Flash>
      <PastEventForm pastEvent={pe} />
      <section className="a-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-green">fotos ({pe.photos.length})</h2>
          <p className="text-sm text-muted">use as setas para mudar a ordem. “★ destacar” coloca a foto na home.</p>
        </div>
        <PhotoManager
          photos={pe.photos}
          upload={uploadPhotoAction.bind(null, `past:${pe.id}`)}
          onToggleFeatured={togglePhotoFeaturedAction}
          onMove={movePhotoAction}
          onDelete={deletePhotoAction}
          onSaveAlt={updatePhotoAction}
          showFeatured
        />
      </section>
    </div>
  );
}
