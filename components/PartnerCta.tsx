import Link from "next/link";
import { ArrowRightIcon, BankIcon, BriefcaseIcon, TractorIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "./Section";

const audiences = [
  { icon: BriefcaseIcon, title: "Yatırımcılar", text: "Tarımda yapay zekâ dönüşümünün erken aşamasında yer alın." },
  { icon: UsersThreeIcon, title: "Kooperatifler ve birlikler", text: "Üyelerinize ücretsiz pilot erişim ve toplu destek sağlayın." },
  { icon: BankIcon, title: "Ziraat odaları ve kurumlar", text: "Sahadaki verilerle bölgesel erken uyarı çalışmalarına katkı verin." },
  { icon: TractorIcon, title: "Pilot çiftlikler", text: "Uygulamayı kendi tarlanızda ilk deneyen ve şekillendiren siz olun." },
];

export function PartnerCta() {
  return (
    <Section
      id="is-birligi"
      eyebrow="İş birliği"
      title="Birlikte büyüyelim"
      intro="Uygulamamızı sahaya birlikte taşıyacağımız kurum ve kişilerle tanışmak istiyoruz."
      className="bg-card"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-3xl border border-border bg-background p-6">
            <span className="blob-alt flex size-12 items-center justify-center bg-gold-soft text-gold">
              <Icon aria-hidden="true" weight="duotone" className="size-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{title}</h3>
            <p className="mt-1.5 text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
      <Link href="/is-birligi" className={buttonVariants({ variant: "outline", className: "group/p mt-10" })}>
        İş birliği için bize ulaşın
        <ArrowRightIcon aria-hidden="true" weight="bold" className="transition-transform group-hover/p:translate-x-0.5" />
      </Link>
    </Section>
  );
}
