"use client";

import Image from "next/image";
import { isLocalUpload } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";

/* ------------------------------------------------------------------ utils */

/**
 * Reduz a foto NO NAVEGADOR antes de enviar (máx. 2400px, JPEG 85%).
 * Fotos de celular de 5–10 MB viram ~500 KB: envio rápido mesmo no 4G
 * e dentro do limite de upload da hospedagem.
 */
export async function shrinkImage(file: File, maxSide = 2400): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // ex.: HEIC em navegadores sem suporte — o servidor tenta converter
  }
}

/* ------------------------------------------------------------------ forms */

export function SubmitButton({ children, className = "a-btn a-btn-primary", pending: forced }: { children: React.ReactNode; className?: string; pending?: boolean }) {
  const status = useFormStatus();
  const pending = forced ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "salvando…" : children}
    </button>
  );
}

/**
 * Formulário com mensagem de sucesso/erro.
 * Envia via onSubmit (em vez de action=) para o React não limpar os campos
 * depois de salvar — assim um erro de validação não apaga o que foi digitado.
 */
export function AdminForm({
  action,
  children,
  className,
  submitLabel = "salvar",
  stickyFooter = true,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  stickyFooter?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [, startTransition] = useTransition();
  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div className={`${stickyFooter ? "sticky bottom-0 z-10 -mx-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8" : "mt-6"} flex flex-wrap items-center gap-4`}>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
        {state.error && (
          <p role="alert" className="text-sm font-medium text-[#9d2748]">
            {state.error}
          </p>
        )}
        {state.message && <p className="text-sm font-medium text-green">{state.message}</p>}
      </div>
    </form>
  );
}

/** Campo de imagem com pré-visualização. Reduz a foto antes do envio. */
export function ImageInput({ name, current, label, help }: { name: string; current?: string | null; label: string; help?: string }) {
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    const small = await shrinkImage(f);
    const dt = new DataTransfer();
    dt.items.add(small);
    if (ref.current) ref.current.files = dt.files;
    setPreview(URL.createObjectURL(small));
    setBusy(false);
  }

  return (
    <div>
      <span className="a-label">{label}</span>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-mist">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-xs text-muted">sem foto</span>
          )}
        </div>
        <label className="a-btn a-btn-soft cursor-pointer">
          {busy ? "preparando…" : preview ? "trocar foto" : "escolher foto"}
          <input ref={ref} type="file" name={name} accept="image/*" className="sr-only" onChange={onChange} />
        </label>
      </div>
      {help && <span className="a-help">{help}</span>}
    </div>
  );
}

/** Botão que pede confirmação antes de executar uma ação destrutiva. */
export function ConfirmButton({
  action,
  children,
  message,
  className = "a-btn a-btn-danger",
}: {
  action: () => Promise<ActionState | void>;
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (!window.confirm(message)) return;
          start(async () => {
            const r = await action();
            if (r && r.error) setError(r.error);
          });
        }}
      >
        {pending ? "aguarde…" : children}
      </button>
      {error && <span className="max-w-sm text-xs text-[#9d2748]">{error}</span>}
    </span>
  );
}

/* ---------------------------------------------------------------- fotos */

export type AdminPhoto = { id: string; url: string; alt: string | null; featured: boolean; width: number | null; height: number | null };

export function PhotoManager({
  photos,
  upload,
  onToggleFeatured,
  onMove,
  onDelete,
  onSaveAlt,
  showFeatured,
}: {
  photos: AdminPhoto[];
  upload: (fd: FormData) => Promise<ActionState>;
  onToggleFeatured: (id: string) => Promise<void>;
  onMove: (id: string, dir: -1 | 1) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSaveAlt: (id: string, fd: FormData) => Promise<void>;
  showFeatured: boolean;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setErrors([]);
    setProgress({ done: 0, total: list.length });
    const errs: string[] = [];
    for (const [i, f] of list.entries()) {
      const fd = new FormData();
      fd.set("photo", await shrinkImage(f));
      const r = await upload(fd);
      if (r.error) errs.push(`${f.name}: ${r.error}`);
      setProgress({ done: i + 1, total: list.length });
    }
    setErrors(errs);
    setProgress(null);
    router.refresh();
  }

  const act = (fn: () => Promise<void>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div>
      <label
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-green/30 bg-white px-6 py-10 text-center transition-colors hover:border-green hover:bg-lime/20"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFiles(e.dataTransfer.files);
        }}
      >
        <span className="font-semibold text-green">
          {progress ? `enviando ${progress.done} de ${progress.total}…` : "clique ou arraste fotos aqui"}
        </span>
        <span className="text-sm text-muted">pode escolher várias de uma vez · jpg, png, webp ou heic</span>
        <input type="file" multiple accept="image/*" className="sr-only" disabled={!!progress} onChange={(e) => onFiles(e.target.files)} />
      </label>
      {errors.length > 0 && (
        <ul className="mt-3 text-sm text-[#9d2748]">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {photos.length > 0 && (
        <ul className={`mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {photos.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative aspect-square bg-mist">
                <Image unoptimized={isLocalUpload(p.url)} src={p.url} alt={p.alt ?? ""} fill sizes="240px" quality={70} className="object-cover" />
                {showFeatured && p.featured && <span className="a-pill absolute left-2 top-2 bg-lime text-green">★ na home</span>}
              </div>
              <div className="space-y-2 p-3">
                <form action={(fd) => act(() => onSaveAlt(p.id, fd))} className="flex gap-1">
                  <input name="alt" defaultValue={p.alt ?? ""} placeholder="descrição (acessibilidade)" className="a-input !py-1.5 text-xs" />
                  <input type="hidden" name="featured" value={p.featured ? "on" : ""} />
                  <button className="a-btn a-btn-soft !px-2 !py-1 text-xs" type="submit">ok</button>
                </form>
                <div className="flex flex-wrap gap-1">
                  <button type="button" className="a-btn a-btn-soft !px-2 !py-1 text-xs" disabled={i === 0} onClick={() => act(() => onMove(p.id, -1))} aria-label="mover para antes">←</button>
                  <button type="button" className="a-btn a-btn-soft !px-2 !py-1 text-xs" disabled={i === photos.length - 1} onClick={() => act(() => onMove(p.id, 1))} aria-label="mover para depois">→</button>
                  {showFeatured && (
                    <button type="button" className="a-btn a-btn-soft !px-2 !py-1 text-xs" onClick={() => act(() => onToggleFeatured(p.id))}>
                      {p.featured ? "tirar da home" : "★ destacar"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="a-btn a-btn-danger !px-2 !py-1 text-xs"
                    onClick={() => window.confirm("apagar esta foto?") && act(() => onDelete(p.id))}
                  >
                    apagar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Mostra/esconde o texto de um campo de cor com seletor. */
export function ColorInput({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => setValue(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" aria-label="escolher cor" />
      <input name={name} value={value} onChange={(e) => setValue(e.target.value)} className="a-input max-w-36 font-mono" pattern="#[0-9a-fA-F]{6}" />
    </div>
  );
}

/** Seleciona o status de uma inscrição e envia na hora (com confirmação). */
export function StatusSelect({ action, current, options }: { action: (fd: FormData) => Promise<void>; current: string; options: [string, string][] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      className="a-input !w-auto !py-1 text-xs"
      defaultValue={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        const label = options.find(([v]) => v === next)?.[1];
        if (!window.confirm(`mudar o status para “${label}”? ${next === "paid" ? "a pessoa recebe a confirmação." : ""}`)) {
          e.target.value = current;
          return;
        }
        const fd = new FormData();
        fd.set("status", next);
        start(async () => {
          await action(fd);
          router.refresh();
        });
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}
