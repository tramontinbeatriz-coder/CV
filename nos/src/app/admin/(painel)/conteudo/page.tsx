import { CONTENT_FIELDS, CONTENT_GROUPS, getContent, isPlaceholder, type ContentGroup, type ContentKey } from "@/lib/content";
import { AdminForm, ColorInput, ConfirmButton, ImageInput } from "@/components/admin/client";
import { resetContentKeysAction, saveContentAction } from "@/app/admin/actions";

export default async function ContentPage() {
  const content = await getContent();
  const groups = Object.keys(CONTENT_GROUPS) as ContentGroup[];
  const byGroup = (g: ContentGroup) => (Object.keys(CONTENT_FIELDS) as ContentKey[]).filter((k) => CONTENT_FIELDS[k].group === g);

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="display text-5xl text-green">textos, contato e cores</h1>
        <p className="mt-1 text-sm text-muted">
          tudo o que aparece no site fora dos encontros. edite, clique em “salvar” e pronto — já vai pro ar.
          campos com fundo amarelinho ainda estão como <em>[placeholder]</em>.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g} href={`#${g}`} className="a-btn a-btn-soft !py-1 text-xs">{CONTENT_GROUPS[g]}</a>
          ))}
        </nav>
      </header>

      <AdminForm action={saveContentAction} className="space-y-6" submitLabel="salvar conteúdo">
        {groups.map((g) => (
          <section key={g} id={g} className="a-card scroll-mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green">{CONTENT_GROUPS[g]}</h2>
              {g === "cores" && (
                <ConfirmButton action={resetContentKeysAction.bind(null, "color_")} message="voltar para as cores originais da identidade?" className="a-btn a-btn-soft !py-1 text-xs">
                  restaurar cores originais
                </ConfirmButton>
              )}
            </div>
            {g === "cores" && (
              <p className="text-sm text-muted">as cores originais vêm do manual “letras & logos & cores”: verde #235c4c, lima #dded91, rosa #e18fa6, creme #f1f1e5.</p>
            )}
            {byGroup(g).map((key) => {
              const f = CONTENT_FIELDS[key] as { label: string; type: string; help?: string };
              const value = content[key];
              const ph = isPlaceholder(value);
              if (f.type === "image") {
                return (
                  <div key={key}>
                    <input type="hidden" name={key} value={value} />
                    <ImageInput name={`${key}__file`} current={value} label={f.label} help={f.help} />
                  </div>
                );
              }
              return (
                <label key={key} className="block">
                  <span className="a-label">{f.label}</span>
                  {f.type === "color" ? (
                    <ColorInput name={key} defaultValue={value} />
                  ) : f.type === "textarea" ? (
                    <textarea name={key} defaultValue={value} className={`a-input ${ph ? "!bg-[#fff8d6]" : ""}`} rows={Math.min(10, Math.max(3, value.split("\n").length + 1))} />
                  ) : (
                    <input name={key} type={f.type === "url" ? "url" : "text"} defaultValue={value} className={`a-input ${ph ? "!bg-[#fff8d6]" : ""}`} />
                  )}
                  {f.help && <span className="a-help">{f.help}</span>}
                </label>
              );
            })}
          </section>
        ))}
      </AdminForm>
    </div>
  );
}
