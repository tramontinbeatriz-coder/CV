import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="md:grid md:min-h-svh md:grid-cols-[240px_1fr]">
      <AdminNav email={session.email} />
      <main className="min-w-0 px-4 pb-16 pt-6 md:px-8 md:pt-10">{children}</main>
    </div>
  );
}
