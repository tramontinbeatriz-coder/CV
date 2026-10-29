import { asc } from "drizzle-orm";
import { AdminForm, ConfirmButton } from "@/components/admin/client";
import { addAdminAction, changePasswordAction, removeAdminAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export default async function AccountPage() {
  const session = await requireAdmin();
  const people = await db
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="display text-5xl text-green">minha conta</h1>
      <p className="text-sm text-muted">conectada como <strong>{session.email}</strong>.</p>

      <AdminForm action={changePasswordAction} submitLabel="trocar senha" stickyFooter={false}>
        <section className="a-card space-y-4">
          <h2 className="text-lg font-semibold text-green">trocar senha</h2>
          <label className="block"><span className="a-label">senha atual</span><input type="password" name="current" autoComplete="current-password" className="a-input" required /></label>
          <label className="block"><span className="a-label">nova senha</span><input type="password" name="next" autoComplete="new-password" minLength={10} className="a-input" required /><span className="a-help">mínimo de 10 caracteres</span></label>
          <label className="block"><span className="a-label">repita a nova senha</span><input type="password" name="confirm" autoComplete="new-password" className="a-input" required /></label>
        </section>
      </AdminForm>

      <section className="a-card space-y-4">
        <h2 className="text-lg font-semibold text-green">quem tem acesso ao painel</h2>
        <ul className="divide-y divide-line">
          {people.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span className="font-medium">{p.name || p.email}</span>
                {p.name && <span className="block text-xs text-muted">{p.email}</span>}
              </span>
              {p.id === session.sub ? (
                <span className="text-xs text-muted">você</span>
              ) : (
                <ConfirmButton action={removeAdminAction.bind(null, p.id)} message={`tirar o acesso de ${p.email} ao painel?`} className="a-btn a-btn-soft !py-1 text-xs">
                  remover
                </ConfirmButton>
              )}
            </li>
          ))}
        </ul>
      </section>

      <AdminForm action={addAdminAction} submitLabel="dar acesso" stickyFooter={false}>
        <section className="a-card space-y-4">
          <h2 className="text-lg font-semibold text-green">dar acesso a outra pessoa</h2>
          <p className="text-sm text-muted">ela entra em /admin com esse e-mail e a senha que você criar aqui. depois, ela mesma pode trocar a senha em “minha conta”.</p>
          <label className="block"><span className="a-label">nome</span><input name="name" className="a-input" /></label>
          <label className="block"><span className="a-label">e-mail</span><input type="email" name="email" className="a-input" required /></label>
          <label className="block"><span className="a-label">senha provisória</span><input type="text" name="password" minLength={10} autoComplete="off" className="a-input" required /><span className="a-help">mínimo de 10 caracteres</span></label>
        </section>
      </AdminForm>
    </div>
  );
}
