import { Section } from "./Section";
import { CtaLink } from "./CtaLink";

const features = [
  {
    icon: "🔍",
    title: "Hastalık ve zararlı tespiti",
    text: "Pas, mildiyö, kurumcuk gibi hastalıkların ve zararlıların belirtilerini fotoğraftan tanır.",
  },
  {
    icon: "📈",
    title: "Hasat başarı tahmini",
    text: "Tarlanızın mevcut durumuna göre hasat başarısını yüzde olarak tahmin eder, gidişatı takip etmenizi sağlar.",
  },
  {
    icon: "💧",
    title: "Ekim ve sulama önerileri",
    text: "Ürününüze, bölgenize ve hava durumuna göre ne zaman ekip ne zaman sulayacağınıza dair öneriler sunar.",
  },
  {
    icon: "📅",
    title: "Tarım takvimi",
    text: "Bu ay tarlanızda yapmanız gerekenleri hatırlatır; ilaçlama, gübreleme ve hasat zamanlarını kaçırmazsınız.",
  },
  {
    icon: "🌦️",
    title: "Çiftçiye özel hava uyarıları",
    text: "Don, yoğun yağış ve ilaçlama için uygun günler hakkında ilinize göre uyarılar verir.",
  },
  {
    icon: "🇹🇷",
    title: "Tamamen Türkçe",
    text: "Sade ve anlaşılır bir dille, büyük yazılar ve kolay kullanım ile her yaştan çiftçiye uygun.",
  },
];

export function Features() {
  return (
    <Section
      id="ozellikler"
      eyebrow="Özellikler"
      title="Neler yapabilir?"
      intro="Bereket AI, tarlanızdaki sorunları erkenden fark etmenize ve doğru kararı vermenize yardım eder."
      className="bg-card/60"
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <li key={f.title} className="rounded-2xl border border-line bg-card p-6">
            <span className="text-4xl" aria-hidden="true">
              {f.icon}
            </span>
            <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-muted">{f.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl bg-primary/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-bold">Uygulama çıktığında ilk kullananlardan olmak ister misiniz?</p>
        <CtaLink />
      </div>
    </Section>
  );
}
