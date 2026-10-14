import Image from "next/image";
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

/** The disease card's backdrop: a real photo of stripe rust on a leaf, fading into the card. */
function RustPhoto() {
  return (
    // Phones: a strip across the top; wider screens: the right side, so the text keeps its full measure.
    <div className="absolute inset-x-0 top-0 h-36 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[44%] sm:[mask-image:linear-gradient(to_left,black_60%,transparent)]">
      <Image src="/demo/bugday-sari-pas.webp" alt="" fill sizes="(min-width: 1024px) 360px, 44vw" className="object-cover object-[60%_50%]" />
    </div>
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
    className: "lg:col-span-2 min-h-[22rem] sm:min-h-[17rem]",
    contentClassName: "sm:max-w-[54%]",
    background: <RustPhoto />,
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
    className: "sm:col-span-2 lg:col-span-3 min-h-0",
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
      <div className="mt-12 flex flex-col items-start gap-4 overflow-hidden panel-cta rounded-3xl bg-panel p-8 text-panel-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-2xl font-bold">Uygulama çıktığında ilk kullananlardan olun.</p>
        <CtaLink className="bg-panel-foreground text-panel shadow-none hover:bg-panel-foreground/90" withArrow />
      </div>
    </Section>
  );
}
