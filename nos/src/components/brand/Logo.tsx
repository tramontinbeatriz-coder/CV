import { LOGO_PATHS, LOGO_VIEWBOX } from "./logo-paths";

/** Logo "nós" (vetor do manual). A cor vem de `currentColor` — use classes text-*. */
export function Logo({ className, title = "nós" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} fill="currentColor" role="img" aria-label={title}>
      {LOGO_PATHS.map((p, i) => (
        <path key={i} transform={p.transform} d={p.d} />
      ))}
    </svg>
  );
}

/** O rabisco / "nó" do manual. Recolorível via currentColor (máscara CSS). */
export function Knot({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`}
      style={{
        WebkitMask: "url(/brand/no-rabisco.svg) center / contain no-repeat",
        mask: "url(/brand/no-rabisco.svg) center / contain no-repeat",
        aspectRatio: "227 / 205",
        ...style,
      }}
    />
  );
}

/**
 * Assinatura completa: traço + "nós" + rabisco, como na capa do manual.
 * Opcionalmente com a palavra "entre" em itálico por cima.
 */
export function Lockup({
  className,
  entre = false,
  dashClass = "text-lime",
  knotClass = "text-pink",
  entreClass = "text-lime",
}: {
  className?: string;
  entre?: boolean;
  dashClass?: string;
  knotClass?: string;
  entreClass?: string;
}) {
  return (
    <span className={`relative inline-flex items-end ${className ?? ""}`}>
      {entre && (
        <span className={`italic-serif absolute -top-[0.05em] left-[0.02em] text-[0.22em] leading-none ${entreClass}`}>
          entre
        </span>
      )}
      <span aria-hidden className={`mb-[0.34em] mr-[-0.12em] h-px w-[0.5em] shrink-0 bg-current ${dashClass}`} />
      <Logo className="h-[1em] w-auto" />
      <Knot className={`mb-[0.02em] ml-[0.02em] w-[0.14em] ${knotClass}`} />
    </span>
  );
}
