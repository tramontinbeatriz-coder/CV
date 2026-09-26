import type { PastEvent } from "@/lib/db/schema";
import { savePastEventAction } from "@/app/admin/actions";
import { AdminForm } from "./client";
import { Field } from "./ui";

export function PastEventForm({ pastEvent: p }: { pastEvent?: PastEvent | null }) {
  return (
    <AdminForm action={savePastEventAction.bind(null, p?.id ?? null)} className="space-y-6" submitLabel={p ? "salvar alterações" : "criar e adicionar fotos"} stickyFooter={false}>
      <section className="a-card grid gap-5 md:grid-cols-3">
        <Field label="nome do encontro *" className="md:col-span-3">
          <input name="title" required defaultValue={p?.title} className="a-input" />
        </Field>
        <Field label="data *" help="no site aparece como mês e ano">
          <input type="date" name="date" required defaultValue={p?.date} className="a-input" />
        </Field>
        <Field label="local" className="md:col-span-2">
          <input name="location" defaultValue={p?.location ?? ""} className="a-input" />
        </Field>
        <Field label="descrição curta" help="uma ou duas frases sobre como foi" className="md:col-span-3">
          <textarea name="description" defaultValue={p?.description ?? ""} className="a-input !min-h-20" />
        </Field>
        <label className="flex items-start gap-3 md:col-span-3">
          <input type="checkbox" name="published" defaultChecked={p?.published ?? true} className="mt-1 h-5 w-5 accent-[var(--green)]" />
          <span><span className="font-semibold text-green">publicado no site</span><span className="a-help !mt-0">aparece em “eventos passados”</span></span>
        </label>
        <label className="flex items-start gap-3 md:col-span-3">
          <input type="checkbox" name="isSample" defaultChecked={p?.isSample ?? false} className="mt-1 h-5 w-5 accent-[var(--green)]" />
          <span><span className="font-semibold text-green">é conteúdo de exemplo</span></span>
        </label>
      </section>
    </AdminForm>
  );
}
