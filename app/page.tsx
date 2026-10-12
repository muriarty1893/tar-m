import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/CtaLink";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-extrabold">{siteConfig.name}</h1>
      <p className="mt-4 text-xl text-muted">{siteConfig.tagline}</p>
      <CtaLink className="mt-8" />
    </section>
  );
}
