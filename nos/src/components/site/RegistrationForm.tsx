"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, waitlistAction, type FormState } from "@/app/(site)/actions";
import { Knot } from "../brand/Logo";

const DISCOVERY = ["instagram", "uma amiga me contou", "whatsapp", "já participei antes", "google", "outro"];

function Field({
  name,
  label,
  error,
  optional,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="block">
      <span className="label flex items-baseline justify-between text-muted">
        {label}
        {optional && <span className="normal-case tracking-normal opacity-70">opcional</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-2 block text-sm text-[#b23b5a]">
          {error}
        </span>
      )}
    </label>
  );
}

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-green w-full py-5 text-sm md:w-auto md:px-10" disabled={pending}>
      {pending ? (
        <>
          <Knot className="w-5 spin-slow text-lime" /> um instante…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function RegistrationForm({
  slug,
  price,
  termsText,
  testMode,
}: {
  slug: string;
  price: string;
  termsText: string;
  testMode: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(registerAction.bind(null, slug), {});
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      {state.error && (
        <p role="alert" className="rounded-sm bg-pink/30 px-4 py-3 text-sm text-green">
          {state.error}
        </p>
      )}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Field name="name" label="nome completo" error={e.name}>
        <input id="name" name="name" className="field" autoComplete="name" required defaultValue={v.name} />
      </Field>
      <div className="grid gap-8 md:grid-cols-2">
        <Field name="email" label="e-mail" error={e.email}>
          <input id="email" name="email" type="email" inputMode="email" className="field" autoComplete="email" required defaultValue={v.email} />
        </Field>
        <Field name="phone" label="telefone / whatsapp" error={e.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="(51) 9…" required defaultValue={v.phone} />
        </Field>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Field name="instagram" label="instagram" optional error={e.instagram}>
          <input id="instagram" name="instagram" className="field" placeholder="@" autoCapitalize="none" defaultValue={v.instagram} />
        </Field>
        <Field name="city" label="cidade" error={e.city}>
          <input id="city" name="city" className="field" autoComplete="address-level2" defaultValue={v.city ?? "Porto Alegre"} />
        </Field>
      </div>
      <Field name="discoverySource" label="como conheceu a nós?" optional>
        <select id="discoverySource" name="discoverySource" className="field appearance-none" defaultValue={v.discoverySource ?? ""}>
          <option value="">escolha uma opção</option>
          {DISCOVERY.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" name="terms" className="mt-1 h-5 w-5 shrink-0 accent-[var(--green)]" defaultChecked={v.terms === "on"} />
        <span>
          {termsText}{" "}
          <Link href="/privacidade" target="_blank" className="link">
            ler a política
          </Link>
          {e.terms && (
            <span role="alert" className="mt-1 block text-[#b23b5a]">
              {e.terms}
            </span>
          )}
        </span>
      </label>

      <div className="flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          valor: <strong className="text-green">{price}</strong>
          <br />
          {testMode ? "modo teste: nenhum valor será cobrado." : "pagamento seguro pelo provedor (pix ou cartão)."}
        </p>
        <Submit>quero participar →</Submit>
      </div>
    </form>
  );
}

export function WaitlistForm({ slug }: { slug: string }) {
  const [state, action] = useActionState<FormState, FormData>(waitlistAction.bind(null, slug), {});
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <div className="flex items-center gap-5 py-6">
        <Knot className="w-12 text-pink wobble" />
        <p className="italic-serif text-2xl text-green">anotado! se abrir uma vaga, a gente te chama. 🤍</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-8" noValidate>
      {state.error && <p role="alert" className="bg-pink/30 px-4 py-3 text-sm">{state.error}</p>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field name="name" label="nome completo" error={e.name}>
        <input id="w-name" name="name" className="field" autoComplete="name" defaultValue={v.name} />
      </Field>
      <div className="grid gap-8 md:grid-cols-2">
        <Field name="email" label="e-mail" error={e.email}>
          <input id="w-email" name="email" type="email" className="field" autoComplete="email" defaultValue={v.email} />
        </Field>
        <Field name="phone" label="telefone / whatsapp" error={e.phone}>
          <input id="w-phone" name="phone" type="tel" className="field" autoComplete="tel" defaultValue={v.phone} />
        </Field>
      </div>
      <Field name="instagram" label="instagram" optional>
        <input id="w-instagram" name="instagram" className="field" placeholder="@" defaultValue={v.instagram} />
      </Field>
      <Submit>entrar na lista de espera</Submit>
    </form>
  );
}
