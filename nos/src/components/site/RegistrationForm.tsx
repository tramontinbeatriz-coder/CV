"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { previewCouponAction, registerAction, waitlistAction, type CouponPreview, type FormState } from "@/app/(site)/actions";
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

/** Campo "cupom de desconto": o botão aplicar mostra o novo valor; o servidor confere de novo ao enviar. */
function CouponField({
  slug,
  initial,
  serverError,
  onPreview,
}: {
  slug: string;
  initial?: string;
  serverError?: string;
  onPreview: (p: CouponPreview | null) => void;
}) {
  const [open, setOpen] = useState(Boolean(initial));
  const [code, setCode] = useState(initial ?? "");
  const [result, setResult] = useState<CouponPreview | null>(null);
  const [pending, start] = useTransition();

  const apply = () =>
    start(async () => {
      const r = await previewCouponAction(slug, code);
      setResult(r);
      onPreview(r.ok ? r : null);
    });

  if (!open) {
    return (
      <button type="button" className="link text-sm" onClick={() => setOpen(true)}>
        tem um cupom de desconto?
      </button>
    );
  }
  const error = result && !result.ok ? result.error : !result ? serverError : undefined;
  return (
    <Field name="couponCode" label="cupom de desconto" optional error={error}>
      <span className="flex items-end gap-3">
        <input
          id="couponCode"
          name="couponCode"
          className="field uppercase"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={40}
          value={code}
          onChange={(ev) => {
            setCode(ev.target.value);
            if (result) {
              setResult(null);
              onPreview(null);
            }
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              if (code.trim()) apply();
            }
          }}
        />
        <button type="button" className="btn btn-outline shrink-0 text-green" disabled={pending || !code.trim()} onClick={apply}>
          {pending ? "…" : "aplicar"}
        </button>
      </span>
      {result?.ok && <span className="mt-2 block text-sm text-green">✓ cupom {result.label} aplicado</span>}
    </Field>
  );
}

export function RegistrationForm({
  slug,
  price,
  acceptsCoupon,
  termsText,
  testMode,
}: {
  slug: string;
  price: string;
  acceptsCoupon: boolean;
  termsText: string;
  testMode: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(registerAction.bind(null, slug), {});
  const [preview, setPreview] = useState<CouponPreview | null>(null);
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
      <Field name="dietaryRestrictions" label="tem alguma restrição alimentar?" optional>
        <input id="dietaryRestrictions" name="dietaryRestrictions" className="field" placeholder="ex.: vegetariana, sem lactose, alergia a amendoim" maxLength={300} defaultValue={v.dietaryRestrictions} />
      </Field>
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

      {acceptsCoupon && <CouponField slug={slug} initial={v.couponCode} serverError={e.couponCode} onPreview={setPreview} />}

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
          valor:{" "}
          {preview?.ok ? (
            <>
              <s className="opacity-60">{preview.originalPrice}</s> <strong className="text-green">{preview.finalPrice}</strong>
            </>
          ) : (
            <strong className="text-green">{price}</strong>
          )}
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
