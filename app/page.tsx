import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getAllArticles } from "@/lib/news";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Section } from "@/components/Section";
import { DemoShowcase } from "@/components/DemoShowcase";
import { WeatherWidget } from "@/components/WeatherWidget";
import { NewsCard } from "@/components/NewsCard";
import { PartnerCta } from "@/components/PartnerCta";
import { Pricing } from "@/components/Pricing";
import { WaitlistForm } from "@/components/WaitlistForm";
import { QuestionSection } from "@/components/QuestionSection";
import { BlurFade } from "@/components/magicui/blur-fade";

export default async function Home() {
  const latest = (await getAllArticles()).slice(0, 3);

  return (
    <>
      {/* Above the fold renders without animation so it paints immediately. */}
      <Hero />

      <BlurFade>
        <HowItWorks />
      </BlurFade>

      <BlurFade>
        <Features />
      </BlurFade>

      <Section
        id="demo"
        eyebrow="Canlı demo"
        title="Uygulamayı deneyin"
        intro="Telefondaki uygulamayı kendiniz kullanın: taramayı başlatın, fotoğrafı çekin ve yapay zekânın yanıtını görün."
        className="bg-surface"
      >
        <DemoShowcase />
      </Section>

      <Section
        id="hava"
        eyebrow="Hava durumu"
        title="Bugün tarlanızda hava nasıl?"
        intro="İlinizin hava durumunu ve çiftçiye özel uyarıları görün."
      >
        <WeatherWidget compact />
      </Section>

      <Section id="haberler" eyebrow="Haberler" title="Son haberler" className="bg-surface">
        {latest.length === 0 ? (
          <p className="text-lg">Henüz haber yok.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((a) => (
              <NewsCard key={a.slug} article={a} />
            ))}
          </div>
        )}
        <Link
          href="/haberler"
          className="group mt-10 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Tüm haberler
          <ArrowRightIcon aria-hidden="true" weight="bold" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Section>

      <Pricing />

      <BlurFade>
        <PartnerCta />
      </BlurFade>

      <QuestionSection />

      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <WaitlistForm />
        </div>
      </section>
    </>
  );
}
