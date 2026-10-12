import Link from "next/link";
import { PlantIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden px-4 py-24 text-center">
      <div aria-hidden="true" className="dot-texture pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-xl">
        <span className="blob mx-auto flex size-24 items-center justify-center bg-secondary text-primary">
          <PlantIcon aria-hidden="true" weight="duotone" className="size-12" />
        </span>
        <p className="mt-6 font-heading text-6xl font-bold text-gold">404</p>
        <h1 className="mt-3 text-3xl font-bold">Sayfa bulunamadı</h1>
        <p className="mt-3 text-lg text-muted-foreground">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants()}>
            Ana sayfaya dön
          </Link>
          <Link href="/haberler" className={buttonVariants({ variant: "outline" })}>
            Haberlere göz at
          </Link>
        </div>
      </div>
    </section>
  );
}
