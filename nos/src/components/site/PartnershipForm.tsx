"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { partnershipAction, type FormState } from "@/app/(site)/actions";
import { Knot } from "../brand/Logo";

function Field({ name, label, error, optional, children }: { name: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
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

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-green w-full py-5 text-sm md:w-auto md:px-10" disabled={pending}>
      {pending ? (
        <>
          <Knot className="w-5 spin-slow text-lime" /> enviando…
        </>
      ) : (
        <>enviar ideia →</>
      )}
    </button>
  );
}

export function PartnershipForm() {
  const [state, action] = useActionState<FormState, FormData>(partnershipAction, {});
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="flex items-center gap-5 py-6" role="status">
        <Knot className="w-12 shrink-0 text-pink wobble" />
        <p className="italic-serif text-2xl text-green md:text-3xl">recebemos! a gente lê com carinho e responde em breve. 🤍</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8" noValidate>
      {state.error && (
        <p role="alert" className="rounded-sm bg-pink/30 px-4 py-3 text-sm text-green">
          {state.error}
        </p>
      )}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-8 md:grid-cols-2">
        <Field name="name" label="seu nome" error={e.name}>
          <input id="name" name="name" className="field" autoComplete="name" required defaultValue={v.name} />
        </Field>
        <Field name="company" label="marca, empresa ou espaço" optional>
          <input id="company" name="company" className="field" autoComplete="organization" defaultValue={v.company} />
        </Field>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Field name="email" label="e-mail" error={e.email}>
          <input id="email" name="email" type="email" inputMode="email" className="field" autoComplete="email" required defaultValue={v.email} />
        </Field>
        <Field name="phone" label="telefone / whatsapp" optional>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="(51) 9…" defaultValue={v.phone} />
        </Field>
      </div>
      <Field name="instagram" label="instagram" optional>
        <input id="instagram" name="instagram" className="field" placeholder="@" autoCapitalize="none" defaultValue={v.instagram} />
      </Field>
      <Field name="idea" label="conta a ideia" error={e.idea}>
        <textarea id="idea" name="idea" rows={5} className="field resize-y" placeholder="que tipo de encontro, para quantas pessoas, alguma data em mente…" required defaultValue={v.idea} />
      </Field>
      <Submit />
    </form>
  );
}
