import type { Metadata } from "next";
import { PartnerForm } from "@/components/PartnerForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "İş Birliği",
  description: "Yatırımcılar, kooperatifler, ziraat odaları ve pilot çiftlikler için Bereket AI iş birliği.",
};

const blocks = [
  {
    title: "Sorun",
    points: [
      "Hastalık ve zararlılar çoğu zaman gözle fark edildiğinde yayılmış oluyor; geç kalınan her gün verim kaybı demek.",
      "Çiftçinin bir uzmana hızlıca ulaşması her zaman mümkün değil, özellikle kırsal bölgelerde.",
      "Mevcut dijital araçların çoğu Türkçe değil ya da çiftçinin günlük kullanımına uygun tasarlanmamış.",
    ],
  },
  {
    title: "Çözümümüz",
    points: [
      "Telefonla çekilen bir fotoğraftan hastalık, zararlı ve stres belirtilerini tanıyan yapay zekâ.",
      "Sade Türkçe öneriler, hasat başarı tahmini ve ile özel hava uyarıları tek uygulamada.",
      "Uzman desteğinin yerini almak değil, çiftçiyi doğru zamanda doğru uzmana yönlendirmek.",
    ],
  },
  {
    title: "Pazar ve fırsat",
    points: [
      "Tarım, Türkiye ekonomisinin ve kırsal istihdamın temel taşlarından biri; milyonlarca işletme küçük ve orta ölçekli.",
      "Akıllı telefon kullanımı kırsalda da yaygınlaşıyor; fotoğraf çekmek herkesin bildiği bir işlem.",
      "İklim değişikliğiyle artan don, kuraklık ve hastalık riskleri erken uyarıya olan ihtiyacı büyütüyor.",
    ],
  },
];

export default function PartnerPage() {
  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="font-bold uppercase tracking-wider text-accent-ink">İş birliği</p>
        <h1 className="mt-1 text-4xl font-extrabold">{siteConfig.name} ile birlikte çalışalım</h1>
        <p className="mt-4 text-xl text-muted">
          Yatırımcılar, kooperatifler, ziraat odaları, kamu kurumları ve pilot çiftliklerle sahaya birlikte çıkmak
          istiyoruz.
        </p>

        <div className="mt-12 space-y-10">
          {blocks.map((b) => (
            <section key={b.title}>
              <h2 className="text-2xl font-extrabold">{b.title}</h2>
              <ul className="mt-4 space-y-3">
                {b.points.map((p) => (
                  <li key={p} className="flex gap-3 text-lg">
                    <span className="mt-1 text-primary" aria-hidden="true">
                      ●
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section id="iletisim-formu" className="mt-14 scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold">Bize ulaşın</h2>
          <p className="mb-6 mt-2 text-muted">Formu doldurun, en kısa sürede size dönüş yapalım.</p>
          <PartnerForm />
        </section>
      </div>
    </div>
  );
}
