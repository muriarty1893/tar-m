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
  { icon: TranslateIcon, title: "Sade ve Türkçe", text: "Teknik terimlerle değil, çiftçinin kendi diliyle konuşan bir site." },
  { icon: ScalesIcon, title: "Dürüst ve açık", text: "Forumda deneyim paylaşılır, kararı çiftçi verir; önemli konularda uzmana yönlendiririz." },
  { icon: ShieldCheckIcon, title: "Veriye saygı", text: "Çiftçinin verisi çiftçinindir; KVKK'ya uygun, şeffaf ve güvenli." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="Hakkımızda" intro="Çiftçiyi çiftçiyle, alıcıyı satıcıyla buluşturuyoruz." />
      <div className="mx-auto max-w-4xl space-y-3 px-2 py-3 sm:px-4 sm:py-6">
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 leading-relaxed sm:p-5">
          <p>
            {siteConfig.name}, tarımı daha verimli ve daha az riskli hâle getirmek için yola çıktı. Amacımız, her çiftçinin
            cebindeki telefonla tarlası hakkında hızlı ve anlaşılır bilgiye ulaşabilmesi.
          </p>
          <p>
            Tarlada karşılaşılan bir sorunun cevabı çoğu zaman başka bir çiftçinin deneyiminde saklı. Bu yüzden forumu,
            pazarı, hava durumunu ve takvimi tek bir yere topladık: doğru soruyu sormak, ürünü doğru alıcıyla buluşturmak
            ve işi zamanında yapmak için.
          </p>
        </div>

        <div className="flex gap-3 rounded-lg border border-border bg-card p-4 sm:p-5">
          <span className="blob flex size-9 shrink-0 items-center justify-center bg-gold-soft text-gold">
            <TargetIcon aria-hidden="true" weight="fill" className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">Misyonumuz</h2>
            <p className="mt-1">
              Türkiye&apos;deki her ölçekten çiftçiye, kendi dilinde, kolay ve güvenilir bir buluşma ve bilgi yeri sunmak.
            </p>
          </div>
        </div>

        <section aria-labelledby="degerler" className="overflow-hidden rounded-lg border border-border bg-card">
          <h2 id="degerler" className="border-b border-border px-4 py-2.5 text-[15px] font-bold">
            Değerlerimiz
          </h2>
          <ul className="grid gap-px bg-border sm:grid-cols-2">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3 bg-card p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <Icon aria-hidden="true" weight="fill" className="size-4" />
                </span>
                <span>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-0.5 text-[0.9375rem] text-muted-foreground">{text}</p>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col items-start gap-3 rounded-lg bg-panel p-4 text-panel-foreground sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-lg font-bold">Yolculuğumuza katılın.</p>
          <CtaLink className="bg-panel-foreground text-panel shadow-none hover:bg-panel-foreground/90" />
        </div>
      </div>
    </>
  );
}
