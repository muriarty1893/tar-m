import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { listPublished } from "@/lib/news-data";
import { Hero } from "@/components/Hero";
import { HomeTools } from "@/components/HomeTools";
import { Section } from "@/components/Section";
import { WeatherWidget } from "@/components/WeatherWidget";
import { NewsCard } from "@/components/NewsCard";
import { PartnerCta } from "@/components/PartnerCta";
import { Pricing } from "@/components/Pricing";
import { QuestionSection } from "@/components/QuestionSection";
import { MobileHome } from "@/components/home/MobileHome";
import { BlurFade } from "@/components/magicui/blur-fade";

/**
 * Two homes in one page: phones and tablets (below 1280 px) get the portal (MobileHome), wide screens
 * the landing page. CSS picks one; the other is display:none, so its lazy images never load.
 */
export default function Home() {
  return (
    <>
      <div className="xl:hidden">
        <MobileHome />
      </div>
      <div className="max-xl:hidden">
        <DesktopHome />
      </div>
    </>
  );
}

async function DesktopHome() {
  const latest = (await listPublished()).slice(0, 3);

  return (
    <>
      {/* Above the fold renders without animation so it paints immediately. */}
      <Hero />

      <HomeTools />

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
    </>
  );
}
