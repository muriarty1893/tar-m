import { CameraIcon, PlantIcon, ScanIcon } from "@phosphor-icons/react/dist/ssr";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Section } from "./Section";

const steps = [
  {
    icon: CameraIcon,
    title: "Fotoğrafı çekin",
    text: "Tarlanızın ya da bitkinizin fotoğrafını telefonunuzla çekip uygulamaya gönderin.",
  },
  {
    icon: ScanIcon,
    title: "Yapay zekâ incelesin",
    text: "Yapay zekâ yaprak, renk ve gelişim belirtilerini saniyeler içinde analiz eder.",
  },
  {
    icon: PlantIcon,
    title: "Önerinizi alın",
    text: "Ne gördüğünü, olası sorunu, yapmanız gerekenleri ve hasat başarı tahminini sade Türkçe ile öğrenin.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="nasil-calisir"
      eyebrow="3 adımda"
      title="Nasıl çalışır?"
      intro="Karmaşık menüler yok. Çek, gönder, öğren."
      align="center"
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="h-full">
            <SpotlightCard className="flex h-full flex-col p-7">
              <div className="flex items-start justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover/spot:bg-primary group-hover/spot:text-primary-foreground">
                  <Icon aria-hidden="true" weight="duotone" className="size-8" />
                </span>
                {/* Decorative numeral via ::before, so it isn't read or contrast-checked as text. */}
                <span
                  aria-hidden="true"
                  data-num={String(i + 1).padStart(2, "0")}
                  className="font-heading text-6xl font-bold leading-none text-primary/10 transition-colors duration-300 before:content-[attr(data-num)] group-hover/spot:text-primary/25"
                />
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-gold">Adım {i + 1}</p>
              <h3 className="mt-1 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </SpotlightCard>
          </li>
        ))}
      </ol>
    </Section>
  );
}
