import {
  BugIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  CloudSunIcon,
  DropIcon,
  TranslateIcon,
} from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Section } from "./Section";
import { CtaLink } from "./CtaLink";

/** Decorative backdrop for the large bento cells. */
function LeafField() {
  return (
    <>
      <div className="dot-texture absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="blob absolute -right-10 -top-12 size-52 bg-blob opacity-80" />
    </>
  );
}

function GrowthBars() {
  return (
    <div className="absolute right-6 top-6 flex h-24 items-end gap-1.5 opacity-90">
      {[35, 50, 45, 65, 60, 80, 92].map((h, i) => (
        <span key={i} className="w-3 rounded-t-md bg-gradient-to-t from-primary/60 to-leaf" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

const features = [
  {
    icon: <BugIcon weight="duotone" />,
    name: "Hastalık ve zararlı tespiti",
    description: "Pas, mildiyö, kurumcuk gibi hastalıkların ve zararlıların belirtilerini fotoğraftan tanır.",
    className: "lg:col-span-2 min-h-[17rem]",
    background: <LeafField />,
  },
  {
    icon: <ChartLineUpIcon weight="duotone" />,
    name: "Hasat başarı tahmini",
    description: "Tarlanızın durumuna göre hasat başarısını yüzde olarak tahmin eder, gidişatı takip etmenizi sağlar.",
    className: "min-h-[17rem]",
    background: <GrowthBars />,
  },
  {
    icon: <DropIcon weight="duotone" />,
    name: "Ekim ve sulama önerileri",
    description: "Ürününüze, bölgenize ve hava durumuna göre ne zaman ekip ne zaman sulayacağınızı önerir.",
  },
  {
    icon: <CalendarDotsIcon weight="duotone" />,
    name: "Tarım takvimi",
    description: "Bu ay tarlanızda yapmanız gerekenleri hatırlatır; ilaçlama, gübreleme ve hasat zamanlarını kaçırmazsınız.",
  },
  {
    icon: <CloudSunIcon weight="duotone" />,
    name: "Çiftçiye özel hava uyarıları",
    description: "Don, yoğun yağış ve ilaçlama için uygun günler hakkında ilinize göre uyarılar verir.",
  },
  {
    icon: <TranslateIcon weight="duotone" />,
    name: "Tamamen Türkçe",
    description: "Sade ve anlaşılır bir dille, büyük yazılar ve kolay kullanım ile her yaştan çiftçiye uygun.",
    className: "lg:col-span-3 lg:min-h-0 bg-secondary",
  },
];

export function Features() {
  return (
    <Section
      id="ozellikler"
      eyebrow="Özellikler"
      title="Neler yapabilir?"
      intro={`${siteConfig.name}, tarlanızdaki sorunları erkenden fark etmenize ve doğru kararı vermenize yardım eder.`}
    >
      <BentoGrid>
        {features.map((f) => (
          <BentoCard key={f.name} {...f} />
        ))}
      </BentoGrid>
      <div className="mt-12 flex flex-col items-start gap-4 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-2xl font-bold">Uygulama çıktığında ilk kullananlardan olun.</p>
        <CtaLink className="bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground/90" withArrow />
      </div>
    </Section>
  );
}
