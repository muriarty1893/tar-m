import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ToolHeader } from "@/components/tool/ToolHeader";

export const metadata: Metadata = {
  title: "Pazar kuralları",
  description: `${siteConfig.name} Pazarı’nda ilan verme kuralları, yasak ürünler ve güvenli alışveriş önerileri.`,
};

const rules = [
  {
    title: "İlan verebileceğiniz şeyler",
    items: [
      "Kendi ürettiğiniz ürün: tahıl, baklagil, meyve, sebze, saman ve balya.",
      "Tohum, fide ve gübre: ambalajlı ve etiketli ya da kendi ürettiğiniz.",
      "El aletleri, sulama malzemesi, tarım ekipmanı, traktör ve römork gibi araçlar.",
    ],
  },
  {
    title: "Yasak olanlar",
    items: [
      "Ruhsatsız ya da etiketsiz zirai ilaç, sahte veya kaçak gübre ve tohum.",
      "Canlı hayvan (bu sürümde Pazar’da hayvan satışı yoktur).",
      "Başkasına ait ya da çalıntı mal, kiralık hizmet gibi gösterilen yanıltıcı ilanlar.",
      "Aynı ilanı defalarca vermek, ilan dışında reklam, telefon veya bağlantı paylaşmak.",
    ],
  },
  {
    title: "Güvenli alışveriş",
    items: [
      "Ürünü görmeden kapora ya da ödeme göndermeyin.",
      "Buluşmayı gündüz, kalabalık bir yerde ya da tarlada yanınızda biriyle yapın.",
      "Araç ve ekipmanda ruhsat, fatura ve şasi numarasını kontrol edin.",
      "Çok ucuz fiyat, acele ettirme ve site dışına çekme dolandırıcılık işaretidir.",
    ],
  },
  {
    title: "Şikâyet ve kaldırma",
    items: [
      "Kurallara uymayan bir ilanı, ilan sayfasındaki “İlanı şikâyet et” ile bildirin.",
      "Ekibimiz şikâyetleri inceler; kurallara aykırı ilanlar kaldırılır, tekrar edenlerin hesabı kapatılabilir.",
      `${siteConfig.name} alıcı ile satıcı arasında aracıdır; satışın tarafı değildir, ödeme almaz.`,
    ],
  },
];

export default function MarketRulesPage() {
  return (
    <>
      <ToolHeader eyebrow="Pazar" title="Pazar kuralları" intro="Herkesin güvenle alıp satabilmesi için birkaç kural." />
      <div className="mx-auto max-w-3xl space-y-3 px-3 py-3 sm:px-4 sm:py-6">
        {rules.map((r) => (
          <section key={r.title} className="overflow-hidden rounded-md border border-border bg-card">
            <h2 className="border-b border-border px-4 py-2.5 text-[15px] font-bold">{r.title}</h2>
            <ul className="list-disc space-y-1.5 py-3 pl-8 pr-4 text-[0.9375rem]">
              {r.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
        <p className="px-1 text-sm text-muted-foreground">
          Kişisel verilerinizin nasıl işlendiğini{" "}
          <Link href="/gizlilik" className="font-semibold text-primary underline underline-offset-4">
            Gizlilik ve KVKK
          </Link>{" "}
          sayfasında bulabilirsiniz.
        </p>
      </div>
    </>
  );
}
