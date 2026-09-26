import Link from "next/link";
import { Knot } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start px-5 pb-24 pt-40 md:pt-52">
      <Knot className="w-20 text-pink wobble" />
      <h1 className="display mt-8 text-7xl text-green md:text-8xl">deu nó.</h1>
      <p className="italic-serif mt-5 text-2xl">essa página não existe (ou o encontro já saiu da agenda).</p>
      <Link href="/eventos" className="btn btn-green mt-10">ver próximos encontros</Link>
    </section>
  );
}
