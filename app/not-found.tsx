import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-accent-ink">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">Sayfa bulunamadı</h1>
      <p className="mt-3 text-lg text-muted">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-on-primary">
          Ana sayfaya dön
        </Link>
        <Link href="/haberler" className="rounded-full border border-line px-6 py-3 font-bold">
          Haberlere göz at
        </Link>
      </div>
    </section>
  );
}
