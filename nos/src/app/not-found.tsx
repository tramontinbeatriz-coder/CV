import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-cream p-8 text-center text-green">
      <div>
        <p className="display text-7xl">deu nó.</p>
        <p className="mt-4">página não encontrada.</p>
        <Link href="/" className="btn btn-green mt-8">voltar ao início</Link>
      </div>
    </main>
  );
}
