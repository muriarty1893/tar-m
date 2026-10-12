import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Bereket AI hakkında merak edilenler: ne zaman çıkacak, ücretli mi, hangi ürünleri tanıyor, verilerim güvende mi?",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Bereket AI nedir?",
    a: "Tarlanızın ya da bitkinizin fotoğrafını gönderdiğinizde, yapay zekâ ile hastalık ve zararlı belirtilerini tanıyan, öneriler sunan ve hasat başarı tahmini veren Türkçe bir mobil uygulamadır.",
  },
  {
    q: "Uygulama ne zaman çıkacak?",
    a: (
      <>
        Uygulama şu anda geliştirme aşamasında. <Link href="/#kayit" className="text-primary underline">Erken erişim listesine</Link>{" "}
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
    a: "Hayır. Bereket AI size hızlı bir ön değerlendirme sunar ve neye dikkat etmeniz gerektiğini gösterir. İlaçlama gibi önemli kararlarda mutlaka bir ziraat mühendisine ya da il/ilçe tarım müdürlüğüne danışmanızı öneririz.",
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
        Ayrıntılar için <Link href="/gizlilik" className="text-primary underline">Gizlilik ve KVKK</Link> sayfasına bakabilirsiniz.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Sıkça Sorulan Sorular</h1>
      <p className="mt-3 text-lg text-muted">
        Aradığınız cevabı bulamadıysanız bize{" "}
        <a href={`mailto:${siteConfig.contactEmail}`} className="text-primary underline">
          {siteConfig.contactEmail}
        </a>{" "}
        adresinden yazın.
      </p>
      <div className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-line bg-card p-5 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
              {f.q}
              <span className="text-2xl text-primary transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="mt-3 text-lg text-muted">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
