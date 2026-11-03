import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Frequently asked questions: the full list on /sss, a few of them on the home page. */
export const faqs: { q: string; a: ReactNode }[] = [
  {
    q: `${siteConfig.name} nedir?`,
    a: "Çiftçiler için Türkçe bir dijital tarım rehberi. Sitede şimdiden çiftçi pazarı ve mesajlaşma, hava durumu, tarım takvimi, tarla ve masraf takibi var. Geliştirdiğimiz mobil uygulama ise tarlanızın fotoğrafından yapay zekâ ile hastalık ve zararlı belirtilerini tanıyacak, öneriler sunacak ve hasat başarı tahmini verecek.",
  },
  {
    q: "Sitede şimdi neleri kullanabilirim?",
    a: (
      <>
        Ücretsiz bir hesapla <Link href="/pazar" className="font-semibold text-primary underline underline-offset-4">Pazar</Link>’da ilan verebilir, alıcı ve satıcılarla
        mesajlaşıp teklif verebilir; <Link href="/takvim" className="font-semibold text-primary underline underline-offset-4">tarım takviminizi</Link> ve{" "}
        <Link href="/tarlalarim" className="font-semibold text-primary underline underline-offset-4">tarlalarınızı</Link> kaydedebilirsiniz.{" "}
        <Link href="/hava" className="font-semibold text-primary underline underline-offset-4">Hava durumu</Link> ve borsa fiyatları için hesap gerekmez. Fotoğraftan
        yapay zekâ taraması henüz yok; ana sayfadaki demo yalnızca nasıl olacağını gösterir.
      </>
    ),
  },
  {
    q: "Pazar’da ödemeyi site mi alıyor?",
    a: `Hayır. ${siteConfig.name} alıcı ile satıcıyı buluşturur; ödeme ve teslim yüz yüze, ürünü görerek yapılır. Ürünü görmeden kapora ya da ödeme göndermeyin. Kurallara uymayan ilanları ilan sayfasından şikâyet edebilirsiniz.`,
  },
  {
    q: "Uygulama ne zaman çıkacak?",
    a: (
      <>
        Uygulama şu anda geliştirme aşamasında. <Link href="/#kayit" className="font-semibold text-primary underline underline-offset-4">Erken erişim listesine</Link>{" "}
        kaydolanlar, uygulama hazır olduğunda ilk haberdar olacak.
      </>
    ),
  },
  {
    q: "Ücretli mi?",
    a: "Erken erişim listesine kayıt tamamen ücretsizdir. Uygulamanın fiyatlandırması henüz belirlenmedi; temel özelliklerin çiftçiler için erişilebilir olmasını hedefliyoruz.",
  },
  {
    q: "Hangi ürünleri tanıyacak?",
    a: "İlk aşamada buğday, arpa, mısır, ayçiçeği ve zeytin gibi Türkiye'de yaygın yetiştirilen ürünlerle başlamayı planlıyoruz. Listeyi çiftçilerden gelen taleplere göre genişleteceğiz.",
  },
  {
    q: "Yapay zekânın önerileri ziraat mühendisinin yerini tutar mı?",
    a: `Hayır. ${siteConfig.name} size hızlı bir ön değerlendirme sunar ve neye dikkat etmeniz gerektiğini gösterir. İlaçlama gibi önemli kararlarda mutlaka bir ziraat mühendisine ya da il/ilçe tarım müdürlüğüne danışmanızı öneririz.`,
  },
  {
    q: "Hasat başarı tahmini nasıl hesaplanıyor?",
    a: "Tahmin; fotoğraftaki bitki sağlığı, tespit edilen sorunlar ve bölgenizin hava koşulları gibi bilgilerden üretilir. Bu bir tahmindir, kesin sonuç değildir; gidişatı takip etmeniz için bir göstergedir.",
  },
  {
    q: "İnternet olmadan çalışacak mı?",
    a: "Fotoğraf analizi için internet bağlantısı gerekecek. Zayıf bağlantıda da çalışabilmesi için fotoğrafları küçültüp gönderecek şekilde tasarlıyoruz.",
  },
  {
    q: "Fotoğraflarım ve bilgilerim ne olacak?",
    a: (
      <>
        Verileriniz yalnızca size hizmet vermek ve uygulamayı geliştirmek için, 6698 sayılı KVKK&apos;ya uygun şekilde işlenir.
        Ayrıntılar için <Link href="/gizlilik" className="font-semibold text-primary underline underline-offset-4">Gizlilik ve KVKK</Link> sayfasına bakabilirsiniz.
      </>
    ),
  },
];

