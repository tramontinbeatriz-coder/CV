import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Knot, Logo } from "@/components/brand/Logo";
import { AutoRefresh } from "@/components/site/AutoRefresh";
import { getContent, instagramUrl } from "@/lib/content";
import { formatLongDate, formatPrice, formatTime, lines } from "@/lib/format";
import { getRegistrationByToken, syncWithProvider } from "@/lib/registrations";

export const metadata: Metadata = { title: "sua inscrição", robots: { index: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ falhou?: string }> };

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const [{ token }, { falhou }] = await Promise.all([params, searchParams]);
  const row = await getRegistrationByToken(token);
  if (!row) notFound();
  const { event } = row;
  // Na volta do checkout, confere direto com o provedor (não depende só do webhook)
  const registration = await syncWithProvider(row.registration);
  const c = await getContent();

  if (registration.paymentStatus === "paid") {
    const info = lines(event.importantInfo);
    const first = registration.name.split(" ")[0];
    return (
      <section className="relative overflow-hidden bg-green pb-24 pt-32 text-cream md:pb-32 md:pt-44">
        <Knot className="absolute -right-10 top-24 w-64 text-pink/25 spin-slow md:w-96" />
        <div className="relative mx-auto max-w-[1100px] px-5 md:px-10">
          <p className="label dash dash-lime rise">inscrição confirmada</p>
          <h1 className="display rise mt-6 text-[16vw] leading-[0.9] md:text-[8.5rem]" style={{ ["--delay" as string]: "100ms" }}>
            você está <span className="text-lime">dentro!</span> 🤍
          </h1>
          <p className="italic-serif rise mt-6 text-2xl md:text-3xl" style={{ ["--delay" as string]: "220ms" }}>
            {first}, seu lugar na nós está confirmado.
          </p>

          {/* "ingresso" */}
          <div className="rise mt-14 grid overflow-hidden rounded-sm bg-cream text-green md:grid-cols-[1fr_auto]" style={{ ["--delay" as string]: "320ms" }}>
            <div className="p-6 md:p-10">
              <p className="label text-muted">encontro</p>
              <p className="display mt-2 text-4xl md:text-5xl">{event.title}</p>
              <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label text-muted">data</dt>
                  <dd className="mt-1">{formatLongDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="label text-muted">horário</dt>
                  <dd className="mt-1">{formatTime(event.time)}</dd>
                </div>
                <div>
                  <dt className="label text-muted">local</dt>
                  <dd className="mt-1">
                    {event.locationName || "a definir"}
                    {event.address && <span className="block text-muted">{event.address}</span>}
                  </dd>
                </div>
              </dl>
              {info.length > 0 && (
                <div className="mt-8 border-t border-line pt-6">
                  <p className="label mb-3 text-muted">informações importantes</p>
                  <ul className="space-y-2 text-sm">
                    {info.map((i) => (
                      <li key={i} className="flex gap-3">
                        <Knot className="mt-1 w-3.5 shrink-0 text-pink" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-6 border-t-2 border-dashed border-green/30 p-6 md:flex-col md:justify-center md:border-l-2 md:border-t-0 md:px-10">
              <Logo className="h-12 w-auto md:h-16" />
              <p className="label text-right md:text-center">
                {formatPrice(registration.amountCents)}
                <br />
                <span className="text-muted">nº {registration.id.slice(0, 8)}</span>
              </p>
            </div>
          </div>

          <div className="rise mt-10 flex flex-wrap gap-4" style={{ ["--delay" as string]: "420ms" }}>
            <a href={`/api/calendario/${token}`} className="btn btn-lime">
              adicionar à agenda
            </a>
            <a href={instagramUrl(c.instagram_handle)} target="_blank" rel="noreferrer" className="btn btn-outline">
              seguir @{c.instagram_handle}
            </a>
          </div>
          <p className="mt-8 text-sm text-cream/70">
            enviamos a confirmação para <strong>{registration.email}</strong>. guarde este link: ele é o seu comprovante.
          </p>
        </div>
      </section>
    );
  }

  const failed = registration.paymentStatus === "failed" || registration.paymentStatus === "cancelled" || !!falhou;
  return (
    <section className="mx-auto max-w-2xl px-5 pb-24 pt-36 text-center md:pt-48">
      <Knot className={`mx-auto w-20 text-pink ${failed ? "" : "spin-slow"}`} />
      {failed ? (
        <>
          <h1 className="display mt-8 text-6xl text-green">o pagamento não foi aprovado</h1>
          <p className="italic-serif mt-5 text-xl">acontece! você pode tentar de novo com outra forma de pagamento.</p>
          <Link href={`/inscricao/${event.slug}`} className="btn btn-green mt-10">
            tentar de novo
          </Link>
        </>
      ) : (
        <>
          <h1 className="display mt-8 text-6xl text-green">quase lá…</h1>
          <p className="italic-serif mt-5 text-xl">
            estamos esperando a confirmação do pagamento de <strong>{event.title}</strong>. no pix costuma ser na hora; esta página atualiza sozinha.
          </p>
          {registration.checkoutUrl && (
            <a href={registration.checkoutUrl} className="btn btn-outline mt-10 text-green">
              voltar para o pagamento
            </a>
          )}
          <AutoRefresh seconds={5} />
        </>
      )}
    </section>
  );
}
