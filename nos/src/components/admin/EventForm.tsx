import type { EventView } from "@/lib/events";
import { centsToInput } from "@/lib/format";
import { EVENT_STATUSES } from "@/lib/db/schema";
import { STATUS_SETTING_LABEL } from "@/lib/spots";
import { saveEventAction } from "@/app/admin/actions";
import { AdminForm, ImageInput } from "./client";
import { Field } from "./ui";

/** Formulário de criação/edição de encontro — pensado para quem não é técnica. */
export function EventForm({ event }: { event?: EventView | null }) {
  const e = event;
  return (
    <AdminForm action={saveEventAction.bind(null, e?.id ?? null)} className="space-y-6" submitLabel={e ? "salvar alterações" : "criar encontro"}>
      <section className="a-card space-y-5">
        <h2 className="text-lg font-semibold text-green">o encontro</h2>
        <Field label="nome do encontro *" help="aparece como título. ex.: defesa pessoal com fran">
          <input name="title" required defaultValue={e?.title} className="a-input" />
        </Field>
        <Field label="frase de destaque" help="uma frase curta e marcante. ex.: “uma manhã para aprender, se movimentar e sair um pouquinho mais confiante.”">
          <input name="tagline" defaultValue={e?.tagline ?? ""} className="a-input" />
        </Field>
        <Field label="descrição curta" help="1 ou 2 frases, aparece nos cards da agenda">
          <textarea name="summary" defaultValue={e?.summary ?? ""} className="a-input !min-h-20" />
        </Field>
        <Field label="descrição completa" help="deixe uma linha em branco entre parágrafos">
          <textarea name="description" defaultValue={e?.description ?? ""} className="a-input !min-h-40" />
        </Field>
      </section>

      <section className="a-card grid gap-5 md:grid-cols-3">
        <h2 className="text-lg font-semibold text-green md:col-span-3">quando e onde</h2>
        <Field label="data *">
          <input type="date" name="date" required defaultValue={e?.date} className="a-input" />
        </Field>
        <Field label="horário *">
          <input type="time" name="time" required defaultValue={e?.time} className="a-input" />
        </Field>
        <Field label="duração" help="texto livre: “2h”, “das 9h às 11h30”">
          <input name="duration" defaultValue={e?.duration ?? ""} className="a-input" />
        </Field>
        <Field label="nome do local" help="ex.: Alameda Bom Fim">
          <input name="locationName" defaultValue={e?.locationName ?? ""} className="a-input" />
        </Field>
        <Field label="endereço" className="md:col-span-2">
          <input name="address" defaultValue={e?.address ?? ""} className="a-input" />
        </Field>
        <Field label="cidade">
          <input name="city" defaultValue={e?.city ?? "Porto Alegre"} className="a-input" />
        </Field>
        <Field label="link do mapa (opcional)" help="cole o link do google maps" className="md:col-span-2">
          <input name="mapsUrl" type="url" defaultValue={e?.mapsUrl ?? ""} className="a-input" />
        </Field>
      </section>

      <section className="a-card grid gap-5 md:grid-cols-3">
        <h2 className="text-lg font-semibold text-green md:col-span-3">valor, vagas e status</h2>
        <Field label="valor (R$)" help="ex.: 90,00 · deixe 0 para gratuito">
          <input name="price" inputMode="decimal" defaultValue={e ? centsToInput(e.priceCents) : ""} placeholder="0,00" className="a-input" />
        </Field>
        <Field label="número total de vagas *" help={e ? `${e.spotsTaken} já pagas · ${e.available} livres agora` : undefined}>
          <input name="totalSpots" type="number" min={0} required defaultValue={e?.totalSpots ?? 20} className="a-input" />
        </Field>
        <Field label="status das inscrições" help="no automático, vira “últimas vagas” e “esgotado” sozinho">
          <select name="status" defaultValue={e?.status ?? "auto"} className="a-input">
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_SETTING_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-start gap-3 md:col-span-3">
          <input type="checkbox" name="published" defaultChecked={e?.published ?? false} className="mt-1 h-5 w-5 accent-[var(--green)]" />
          <span>
            <span className="font-semibold text-green">publicado no site</span>
            <span className="a-help !mt-0">desmarcado = rascunho, só você vê (útil para preparar com calma)</span>
          </span>
        </label>
        <label className="flex items-start gap-3 md:col-span-3">
          <input type="checkbox" name="isSample" defaultChecked={e?.isSample ?? false} className="mt-1 h-5 w-5 accent-[var(--green)]" />
          <span>
            <span className="font-semibold text-green">é conteúdo de exemplo</span>
            <span className="a-help !mt-0">mostra a etiqueta “conteúdo de exemplo” no site. desmarque quando o encontro for real.</span>
          </span>
        </label>
      </section>

      <section className="a-card grid gap-5 md:grid-cols-2">
        <h2 className="text-lg font-semibold text-green md:col-span-2">foto e detalhes</h2>
        <ImageInput name="cover" current={e?.coverImage} label="foto principal" help="de preferência vertical ou quadrada, com gente e luz natural" />
        <Field label="descrição da foto" help="para acessibilidade (leitores de tela)">
          <input name="coverAlt" defaultValue={e?.coverAlt ?? ""} className="a-input" />
        </Field>
        <Field label="o que está incluso" help="um item por linha">
          <textarea name="included" defaultValue={e?.included ?? ""} className="a-input" />
        </Field>
        <Field label="informações importantes" help="um item por linha — aparecem também na confirmação">
          <textarea name="importantInfo" defaultValue={e?.importantInfo ?? ""} className="a-input" />
        </Field>
        <Field label="endereço da página (opcional)" help="gerado a partir do nome se ficar vazio" className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">/eventos/</span>
            <input name="slug" defaultValue={e?.slug ?? ""} className="a-input" />
          </div>
        </Field>
      </section>
    </AdminForm>
  );
}
