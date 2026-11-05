import type { Metadata } from "next";
import { ChartLineUpIcon, LightbulbIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PartnerForm } from "@/components/PartnerForm";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "İş Birliği",
  description: `Yatırımcılar, kooperatifler, ziraat odaları ve pilot çiftlikler için ${siteConfig.name} iş birliği.`,
};

const blocks = [
  {
    title: "Sorun",
    icon: WarningCircleIcon,
    points: [
      "Çiftçinin bir uzmana ya da deneyimli bir komşuya hızlıca ulaşması her zaman mümkün değil, özellikle kırsal bölgelerde.",
      "Ürününü satmak ya da alet, tohum almak isteyen çiftçi için güvenilir ve kolay bir buluşma yeri yok.",
      "Mevcut dijital araçların çoğu Türkçe değil ya da çiftçinin günlük kullanımına uygun tasarlanmamış.",
    ],
  },
  {
    title: "Çözümümüz",
    icon: LightbulbIcon,
    points: [
      "Çiftçilerin soru sorup deneyimini paylaştığı, kategorilere ayrılmış bir forum.",
      "Çiftçiden çiftçiye pazar: ilan, site içi mesajlaşma ve teklif.",
      "İle özel hava durumu ve uyarılar, borsa fiyatları, tarım takvimi, tarla ve masraf takibi tek yerde.",
      "Telefona göre tasarlandı: tarladayken de tek elle kullanılır.",
    ],
  },
  {
    title: "Pazar ve fırsat",
    icon: ChartLineUpIcon,
    points: [
      "Tarım, Türkiye ekonomisinin ve kırsal istihdamın temel taşlarından biri; milyonlarca işletme küçük ve orta ölçekli.",
      "Akıllı telefon kullanımı kırsalda da yaygınlaşıyor.",
      "Tarıma ürün ve hizmet sunan firmalar için çiftçiye doğrudan ulaşan reklam ve sponsorluk alanları.",
    ],
  },
];

export default function PartnerPage() {
  return (
    <>
      <PageHero
        title={`${siteConfig.name} ile birlikte çalışalım`}
        intro="Yatırımcılar, kooperatifler, ziraat odaları, kamu kurumları ve pilot çiftliklerle sahaya birlikte çıkmak istiyoruz."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {blocks.map(({ title, icon: Icon, points }) => (
            <section key={title} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <span className="blob flex size-14 items-center justify-center bg-secondary text-primary">
                <Icon aria-hidden="true" weight="duotone" className="size-7" />
              </span>
              <h2 className="mt-5 text-2xl font-bold">{title}</h2>
              <ul className="mt-4 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 text-muted-foreground">
                    <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-gold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          id="iletisim-formu"
          className="mx-auto mt-16 max-w-4xl scroll-mt-24 rounded-3xl border border-border bg-card p-7 shadow-lift sm:p-10"
        >
          <h2 className="text-3xl font-bold tracking-tight">Bize ulaşın</h2>
          <p className="mb-8 mt-2 text-lg text-muted-foreground">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
          <PartnerForm />
        </section>
      </div>
    </>
  );
}
