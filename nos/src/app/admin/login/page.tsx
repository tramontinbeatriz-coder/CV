import { redirect } from "next/navigation";
import { Knot, Logo } from "@/components/brand/Logo";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-svh md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-green p-12 text-cream md:flex">
        <Logo className="h-12 w-auto self-start" />
        <p className="display text-7xl leading-[0.95]">
          bem-vinda
          <br />
          <span className="text-lime">de volta.</span>
        </p>
        <Knot className="absolute -bottom-16 -right-16 w-96 text-pink/30 spin-slow" />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-10 h-10 w-auto text-green md:hidden" />
          <h1 className="text-2xl font-semibold text-green">painel da nós</h1>
          <p className="mt-1 text-sm text-muted">entre com seu e-mail e senha.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
