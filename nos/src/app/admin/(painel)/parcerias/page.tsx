import { ConfirmButton } from "@/components/admin/client";
import { deletePartnershipAction, setPartnershipAnsweredAction } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/format";
import { listPartnershipRequests } from "@/lib/partnerships";

export default async function PartnershipsAdminPage() {
  const rows = await listPartnershipRequests();
  const open = rows.filter((r) => !r.answered).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-5xl text-green">parcerias</h1>
        <p className="mt-1 text-sm text-muted">
          ideias enviadas pela página “parcerias” do site. {open > 0 ? `${open} aguardando resposta.` : "tudo respondido."}
        </p>
      </header>

      {rows.length === 0 ? (
        <section className="a-card">
          <p className="text-sm text-muted">nenhum pedido ainda. quando alguém preencher o formulário em /parcerias, aparece aqui.</p>
        </section>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const digits = r.phone?.replace(/\D/g, "") ?? "";
            return (
              <li key={r.id} className={`a-card ${r.answered ? "opacity-60" : "border-lime"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-green">
                      {r.name}
                      {r.company && <span className="font-normal text-muted"> · {r.company}</span>}
                    </p>
                    <p className="mt-1 text-sm">
                      <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                      {r.phone && (
                        <>
                          {" · "}
                          <a className="underline" href={`https://wa.me/55${digits.replace(/^55(?=\d{10,11}$)/, "")}`} target="_blank" rel="noreferrer">{r.phone}</a>
                        </>
                      )}
                      {r.instagram && (
                        <>
                          {" · "}
                          <a className="underline" href={`https://instagram.com/${r.instagram}`} target="_blank" rel="noreferrer">@{r.instagram}</a>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{r.idea}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setPartnershipAnsweredAction.bind(null, r.id, !r.answered)}>
                    <button className="a-btn a-btn-soft !py-1 text-xs">{r.answered ? "marcar como não respondido" : "marcar como respondido ✓"}</button>
                  </form>
                  <ConfirmButton action={deletePartnershipAction.bind(null, r.id)} message="apagar esse pedido de parceria?" className="a-btn !py-1 text-xs text-muted hover:text-[#b23b5a]">
                    apagar
                  </ConfirmButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
