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
      "Hastalık ve zararlılar çoğu zaman gözle fark edildiğinde yayılmış oluyor; geç kalınan her gün verim kaybı demek.",
      "Çiftçinin bir uzmana hızlıca ulaşması her zaman mümkün değil, özellikle kırsal bölgelerde.",
      "Mevcut dijital araçların çoğu Türkçe değil ya da çiftçinin günlük kullanımına uygun tasarlanmamış.",
    ],
  },
  {
    title: "Çözümümüz",
    icon: LightbulbIcon,
    points: [
      "Telefonla çekilen bir fotoğraftan hastalık, zararlı ve stres belirtilerini tanıyan yapay zekâ.",
      "Sade Türkçe öneriler, hasat başarı tahmini ve ile özel hava uyarıları tek uygulamada.",
      "Uzman desteğinin yerini almak değil, çiftçiyi doğru zamanda doğru uzmana yönlendirmek.",
    ],
  },
  {
    title: "Pazar ve fırsat",
    icon: ChartLineUpIcon,
    points: [
      "Tarım, Türkiye ekonomisinin ve kırsal istihdamın temel taşlarından biri; milyonlarca işletme küçük ve orta ölçekli.",
      "Akıllı telefon kullanımı kırsalda da yaygınlaşıyor; fotoğraf çekmek herkesin bildiği bir işlem.",
      "İklim değişikliğiyle artan don, kuraklık ve hastalık riskleri erken uyarıya olan ihtiyacı büyütüyor.",
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
          className="mx-auto mt-16 max-w-4xl scroll-mt-24 rounded-[2rem] border border-border bg-card p-7 shadow-lift sm:p-10"
        >
          <h2 className="text-3xl font-bold tracking-tight">Bize ulaşın</h2>
          <p className="mb-8 mt-2 text-lg text-muted-foreground">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
          <PartnerForm />
        </section>
      </div>
    </>
  );
}
