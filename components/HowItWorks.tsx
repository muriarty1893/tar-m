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
    >
      <ol className="relative grid gap-6 md:grid-cols-3">
        {/* Connecting line between the steps on wide screens. */}
        <div
          aria-hidden="true"
          className="absolute left-[16%] right-[16%] top-11 hidden border-t-2 border-dashed border-input md:block"
        />
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative flex flex-col items-center text-center">
            <span className="blob relative flex size-22 items-center justify-center bg-secondary text-primary shadow-soft">
              <Icon aria-hidden="true" weight="duotone" className="size-10" />
              <span className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-gold font-heading text-sm font-bold text-gold-foreground">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-6 text-xl font-bold">{title}</h3>
            <p className="mt-2 max-w-xs text-muted-foreground">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
