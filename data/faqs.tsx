import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Frequently asked questions: the full list on /sss, a few of them on the home page. */
export const faqs: { q: string; a: ReactNode }[] = [
  {
    q: `${siteConfig.name} nedir?`,
    a: "Çiftçiler için Türkçe bir dijital tarım rehberi ve topluluğu: çiftçi forumu, çiftçi pazarı ve mesajlaşma, hava durumu, borsa fiyatları, tarım takvimi, tarla ve masraf takibi bir arada.",
  },
  {
    q: "Sitede neleri kullanabilirim?",
    a: (
      <>
        Ücretsiz bir hesapla <Link href="/forum" className="font-semibold text-primary underline underline-offset-4">Forum</Link>’da konu açıp diğer çiftçilere
        sorabilir, <Link href="/pazar" className="font-semibold text-primary underline underline-offset-4">Pazar</Link>’da ilan verip alıcı ve satıcılarla mesajlaşabilir,
        teklif verebilir; <Link href="/takvim" className="font-semibold text-primary underline underline-offset-4">tarım takviminizi</Link> ve{" "}
        <Link href="/tarlalarim" className="font-semibold text-primary underline underline-offset-4">tarlalarınızı</Link> kaydedebilirsiniz. Forumu okumak,{" "}
        <Link href="/hava" className="font-semibold text-primary underline underline-offset-4">hava durumu</Link> ve borsa fiyatları için hesap gerekmez.
      </>
    ),
  },
  {
    q: "Forumda konu açarken nelere dikkat etmeliyim?",
    a: "Konunuz için uygun kategoriyi seçin, başlığı kısa ve açık yazın, açıklamada ne ektiğinizi, nerede ve ne zaman olduğunu anlatın; fotoğraf eklemek çoğu zaman en kolay anlatımdır. Telefon ve adres paylaşmayın; hakaret ve reklam içeren konular kaldırılır.",
  },
  {
    q: "Pazar’da ödemeyi site mi alıyor?",
    a: `Hayır. ${siteConfig.name} alıcı ile satıcıyı buluşturur; ödeme ve teslim yüz yüze, ürünü görerek yapılır. Ürünü görmeden kapora ya da ödeme göndermeyin. Kurallara uymayan ilanları ilan sayfasından şikâyet edebilirsiniz.`,
  },
  {
    q: "Telefondan kullanabilir miyim?",
    a: "Evet. Site telefona göre tasarlandı: alttaki menüden Ana sayfa, Pazar, Takvim ve Hava ile Hızlı menüye tek dokunuşla geçersiniz. Mobil uygulamamız da geliştiriliyor.",
  },
  {
    q: "Ücretli mi?",
    a: "Hesap açmak ve sitedeki forum, pazar, hava durumu, takvim ve tarla takibi ücretsizdir.",
  },
  {
    q: "Forumdaki yanıtlar ziraat mühendisinin yerini tutar mı?",
    a: "Hayır. Forumdaki yanıtlar çiftçilerin kendi deneyimleridir. İlaçlama gibi önemli kararlarda mutlaka bir ziraat mühendisine ya da il/ilçe tarım müdürlüğüne danışmanızı öneririz.",
  },
  {
    q: "Fotoğraflarım ve bilgilerim ne olacak?",
    a: (
      <>
        Verileriniz yalnızca size hizmet vermek ve siteyi geliştirmek için, 6698 sayılı KVKK&apos;ya uygun şekilde işlenir.
        Ayrıntılar için <Link href="/gizlilik" className="font-semibold text-primary underline underline-offset-4">Gizlilik ve KVKK</Link> sayfasına bakabilirsiniz.
      </>
    ),
  },
];

