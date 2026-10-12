import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { HandHeartIcon, ScalesIcon, ShieldCheckIcon, TranslateIcon, TargetIcon } from "@phosphor-icons/react/dist/ssr";
import { CtaLink } from "@/components/CtaLink";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${siteConfig.name}: hikâyemiz, misyonumuz ve değerlerimiz.`,
};

const values = [
  { icon: HandHeartIcon, title: "Çiftçi önce gelir", text: "Her özelliği, tarlada çalışan birinin gerçekten işine yarayıp yaramayacağına bakarak tasarlıyoruz." },
  { icon: TranslateIcon, title: "Sade ve Türkçe", text: "Teknik terimlerle değil, çiftçinin kendi diliyle konuşan bir uygulama." },
  { icon: ScalesIcon, title: "Dürüst tahmin", text: "Yapay zekânın sınırlarını açıkça söyler, gerektiğinde uzmana yönlendiririz." },
  { icon: ShieldCheckIcon, title: "Veriye saygı", text: "Çiftçinin verisi çiftçinindir; KVKK'ya uygun, şeffaf ve güvenli." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Hakkımızda" title="Hakkımızda" intro="Yapay zekâyı çiftçinin gözünün yerine değil, yanına koyuyoruz." />
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="space-y-5 text-lg leading-relaxed">
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

        <div className="mt-12 flex gap-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
          <span className="blob flex size-14 shrink-0 items-center justify-center bg-gold-soft text-gold">
            <TargetIcon aria-hidden="true" weight="duotone" className="size-7" />
          </span>
          <div>
            <h2 className="text-2xl font-bold">Misyonumuz</h2>
            <p className="mt-2 text-lg">
              Türkiye&apos;deki her ölçekten çiftçiye, kendi dilinde, kolay ve güvenilir bir yapay zekâ tarla asistanı sunmak.
            </p>
          </div>
        </div>

        <h2 className="mt-14 text-2xl font-bold">Değerlerimiz</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon aria-hidden="true" weight="duotone" className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-2xl font-bold">Yolculuğumuza katılın.</p>
          <CtaLink className="bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground/90" withArrow />
        </div>
      </div>
    </>
  );
}
