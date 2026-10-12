import Link from "next/link";
import { getAllArticles } from "@/lib/news";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Section } from "@/components/Section";
import { DemoShowcase } from "@/components/DemoShowcase";
import { WeatherWidget } from "@/components/WeatherWidget";
import { NewsCard } from "@/components/NewsCard";
import { PartnerCta } from "@/components/PartnerCta";
import { WaitlistForm } from "@/components/WaitlistForm";

export default async function Home() {
  const latest = (await getAllArticles()).slice(0, 3);

  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />

      <Section
        id="demo"
        eyebrow="Canlı demo"
        title="Uygulamayı deneyin"
        intro="Örnek tarla fotoğraflarından birini seçin ve Bereket AI'nin nasıl yanıt verdiğini görün."
      >
        <DemoShowcase />
      </Section>

      <Section
        id="hava"
        eyebrow="Hava durumu"
        title="Bugün tarlanızda hava nasıl?"
        intro="İlinizin hava durumunu ve çiftçiye özel uyarıları görün."
        className="bg-card/60"
      >
        <div className="max-w-2xl">
          <WeatherWidget compact />
        </div>
      </Section>

      <Section id="haberler" eyebrow="Haberler" title="Son haberler">
        {latest.length === 0 ? (
          <p className="text-lg">Henüz haber yok.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <NewsCard key={a.slug} article={a} />
            ))}
          </div>
        )}
        <Link href="/haberler" className="mt-8 inline-block font-bold text-primary underline">
          Tüm haberler →
        </Link>
      </Section>

      <PartnerCta />

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <WaitlistForm />
        </div>
      </section>
    </>
  );
}
