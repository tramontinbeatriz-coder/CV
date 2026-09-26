import Link from "next/link";
import type { EventView } from "@/lib/events";
import { formatPrice } from "@/lib/format";
import { canRegister } from "@/lib/spots";
import { isTestMode } from "@/lib/payments";
import { Knot } from "../brand/Logo";
import { RegistrationForm, WaitlistForm } from "./RegistrationForm";

/** Mostra o formulário certo conforme o status: inscrição, lista de espera ou encerrado. */
export function RegistrationBlock({ event, termsText, cancelled }: { event: EventView; termsText: string; cancelled?: boolean }) {
  if (canRegister(event.effective)) {
    return (
      <>
        {cancelled && (
          <p className="mb-8 bg-lime/60 px-4 py-3 text-sm text-green">
            o pagamento não foi concluído. sua vaga fica guardada por alguns minutos — é só tentar de novo.
          </p>
        )}
        <RegistrationForm slug={event.slug} price={formatPrice(event.priceCents)} termsText={termsText} testMode={isTestMode()} />
      </>
    );
  }
  if (event.effective === "sold_out") {
    return (
      <div>
        <div className="mb-10 flex items-start gap-4">
          <Knot className="mt-1 w-10 shrink-0 text-pink" />
          <p className="italic-serif text-2xl leading-snug text-green md:text-3xl">
            as vagas esgotaram. deixa seu contato na lista de espera — se alguém desistir, você é a primeira a saber.
          </p>
        </div>
        <WaitlistForm slug={event.slug} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-6">
      <p className="italic-serif text-3xl text-green">as inscrições para esse encontro estão encerradas.</p>
      <Link href="/eventos" className="btn btn-green">
        ver outros encontros
      </Link>
    </div>
  );
}
