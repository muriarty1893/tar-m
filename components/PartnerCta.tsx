import Link from "next/link";
import { Section } from "./Section";

const audiences = [
  { icon: "💼", title: "Yatırımcılar", text: "Tarımda yapay zekâ dönüşümünün erken aşamasında yer alın." },
  { icon: "🤝", title: "Kooperatifler ve birlikler", text: "Üyelerinize ücretsiz pilot erişim ve toplu destek sağlayın." },
  { icon: "🏛️", title: "Ziraat odaları ve kurumlar", text: "Sahadaki verilerle bölgesel erken uyarı çalışmalarına katkı verin." },
  { icon: "🚜", title: "Pilot çiftlikler", text: "Uygulamayı kendi tarlanızda ilk deneyen ve şekillendiren siz olun." },
];

export function PartnerCta() {
  return (
    <Section
      id="is-birligi"
      eyebrow="İş birliği"
      title="Birlikte büyüyelim"
      intro="Bereket AI'yi sahaya birlikte taşıyacağımız kurum ve kişilerle tanışmak istiyoruz."
      className="bg-primary/5"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <li key={a.title} className="rounded-2xl border border-line bg-card p-5">
            <span className="text-3xl" aria-hidden="true">
              {a.icon}
            </span>
            <h3 className="mt-2 text-lg font-bold">{a.title}</h3>
            <p className="mt-1 text-muted">{a.text}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/is-birligi"
        className="mt-8 inline-flex min-h-12 items-center rounded-full border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary/10"
      >
        İş birliği için bize ulaşın →
      </Link>
    </Section>
  );
}
