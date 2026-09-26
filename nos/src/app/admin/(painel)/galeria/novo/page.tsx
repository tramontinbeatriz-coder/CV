import Link from "next/link";
import { PastEventForm } from "@/components/admin/PastEventForm";

export default function NewGallery() {
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/galeria" className="text-sm underline">← eventos passados</Link>
      <h1 className="display text-5xl text-green">nova galeria</h1>
      <p className="text-sm text-muted">preencha os dados do encontro. na próxima tela você adiciona as fotos.</p>
      <PastEventForm />
    </div>
  );
}
