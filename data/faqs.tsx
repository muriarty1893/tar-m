import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Frequently asked questions: the full list on /sss, a few of them on the home page. */
export const faqs: { q: string; a: ReactNode }[] = [
  {
    q: `${siteConfig.name} nedir?`,
    a: "Tarlanızın ya da bitkinizin fotoğrafını gönderdiğinizde, yapay zekâ ile hastalık ve zararlı belirtilerini tanıyan, öneriler sunan ve hasat başarı tahmini veren Türkçe bir mobil uygulamadır.",
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

