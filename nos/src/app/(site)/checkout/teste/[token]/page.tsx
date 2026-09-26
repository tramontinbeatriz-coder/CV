import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Knot } from "@/components/brand/Logo";
import { mockPayAction } from "../../../actions";
import { isTestMode } from "@/lib/payments";
import { getRegistrationByToken } from "@/lib/registrations";
import { formatLongDate, formatPrice, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "checkout de teste", robots: { index: false } };

/**
 * CHECKOUT DE TESTE — simula a tela do provedor de pagamento.
 * Só existe com PAYMENT_PROVIDER=mock. Nenhum dado de cartão é pedido ou guardado.
 */
export default async function MockCheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isTestMode()) notFound();
  const row = await getRegistrationByToken(token);
  if (!row) notFound();
  const { registration: r, event } = row;

  return (
    <section className="mx-auto max-w-xl px-5 pb-24 pt-32 md:pt-40">
      <div className="border-2 border-dashed border-pink p-6 md:p-10">
        <p className="tag bg-pink text-green">modo teste · nenhum valor será cobrado</p>
        <h1 className="display mt-6 text-5xl text-green">checkout de teste</h1>
        <p className="mt-4 text-sm text-muted">
          esta tela simula o checkout do provedor de pagamento (mercado pago / stripe). em produção, aqui a pessoa pagaria com pix ou cartão
          no ambiente seguro do provedor.
        </p>

        <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
          <Row k="encontro" v={event.title} />
          <Row k="quando" v={`${formatLongDate(event.date)}, ${formatTime(event.time)}`} />
          <Row k="nome" v={r.name} />
          <Row k="e-mail" v={r.email} />
          <Row k="valor" v={formatPrice(r.amountCents)} />
          <Row k="status" v={r.paymentStatus} />
        </dl>

        {r.paymentStatus === "pending" ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <form action={mockPayAction.bind(null, token, "approve")} className="flex-1">
              <button className="btn btn-green w-full py-5" type="submit">
                simular pagamento aprovado
              </button>
            </form>
            <form action={mockPayAction.bind(null, token, "decline")} className="flex-1">
              <button className="btn btn-outline w-full py-5 text-green" type="submit">
                simular recusa
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-8 flex items-center gap-3 text-green">
            <Knot className="w-6 text-pink" /> essa inscrição já foi processada ({r.paymentStatus}).
          </p>
        )}
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-4 py-3">
      <dt className="label text-muted">{k}</dt>
      <dd className="text-green">{v}</dd>
    </div>
  );
}
