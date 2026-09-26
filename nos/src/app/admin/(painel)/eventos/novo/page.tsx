import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/eventos" className="text-sm underline">← encontros</Link>
      <h1 className="display text-5xl text-green">novo encontro</h1>
      <p className="text-sm text-muted">campos com * são obrigatórios. dá para salvar como rascunho e publicar depois.</p>
      <EventForm />
    </div>
  );
}
