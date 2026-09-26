import { AdminForm } from "@/components/admin/client";
import { changePasswordAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AccountPage() {
  const session = await requireAdmin();
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
      <div className="a-card text-sm text-muted">
        para dar acesso a outra pessoa, rode no terminal do projeto:
        <code className="mt-2 block rounded bg-mist p-2 text-ink">npm run admin:create -- email@exemplo.com &quot;senha-forte&quot; &quot;Nome&quot;</code>
      </div>
    </div>
  );
}
