import { CameraIcon, PlantIcon, ScanIcon } from "@phosphor-icons/react/dist/ssr";
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
      // No top rule: the hero's field photo fades out across this section's top padding.
      className="border-t-0!"
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-start justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon aria-hidden="true" weight="duotone" className="size-8" />
                </span>
                {/* Decorative numeral via ::before, so it isn't read or contrast-checked as text. */}
                <span
                  aria-hidden="true"
                  data-num={String(i + 1).padStart(2, "0")}
                  className="font-heading text-6xl font-bold leading-none text-primary/10 before:content-[attr(data-num)]"
                />
              </div>
              <p className="eyebrow mt-6 self-start">Adım {i + 1}</p>
              <h3 className="mt-1 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
