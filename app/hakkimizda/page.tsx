import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { CtaLink } from "@/components/CtaLink";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${siteConfig.name}: hikâyemiz, misyonumuz ve değerlerimiz.`,
};

const values = [
  { title: "Çiftçi önce gelir", text: "Her özelliği, tarlada çalışan birinin gerçekten işine yarayıp yaramayacağına bakarak tasarlıyoruz." },
  { title: "Sade ve Türkçe", text: "Teknik terimlerle değil, çiftçinin kendi diliyle konuşan bir uygulama." },
  { title: "Dürüst tahmin", text: "Yapay zekânın sınırlarını açıkça söyler, gerektiğinde uzmana yönlendiririz." },
  { title: "Veriye saygı", text: "Çiftçinin verisi çiftçinindir; KVKK'ya uygun, şeffaf ve güvenli." },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Hakkımızda</h1>
      <div className="mt-6 space-y-5 text-lg leading-relaxed">
        <p>
          {siteConfig.name}, tarımı daha verimli ve daha az riskli hâle getirmek için yola çıktı. Amacımız, her çiftçinin
          cebindeki telefonla tarlası hakkında hızlı ve anlaşılır bilgiye ulaşabilmesi.
        </p>
        <p>
          Hastalıklar ve zararlılar çoğu zaman fark edildiğinde iş işten geçmiş oluyor. Biz, yapay zekâyı çiftçinin
          gözünün yerine değil, yanına koymak istiyoruz: erken fark etmek, doğru soruyu sormak ve zamanında uzmana
          ulaşmak için.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-extrabold">Misyonumuz</h2>
      <p className="mt-3 text-lg">
        Türkiye&apos;deki her ölçekten çiftçiye, kendi dilinde, kolay ve güvenilir bir yapay zekâ tarla asistanı sunmak.
      </p>

      <h2 className="mt-12 text-2xl font-extrabold">Değerlerimiz</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {values.map((v) => (
          <li key={v.title} className="rounded-2xl border border-line bg-card p-5">
            <h3 className="text-lg font-bold">{v.title}</h3>
            <p className="mt-1 text-muted">{v.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-2xl bg-primary/10 p-6">
        <p className="text-lg font-bold">Yolculuğumuza katılın.</p>
        <CtaLink className="mt-4" />
      </div>
    </section>
  );
}
