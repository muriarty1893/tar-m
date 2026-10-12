import { Section } from "./Section";

const steps = [
  {
    icon: "📷",
    title: "Fotoğrafı çekin",
    text: "Tarlanızın ya da bitkinizin fotoğrafını telefonunuzla çekip uygulamaya gönderin.",
  },
  {
    icon: "🤖",
    title: "Yapay zekâ incelesin",
    text: "Yapay zekâ yaprak, renk ve gelişim belirtilerini saniyeler içinde analiz eder.",
  },
  {
    icon: "🌾",
    title: "Önerinizi alın",
    text: "Ne gördüğünü, olası sorunu, yapmanız gerekenleri ve hasat başarı tahminini sade Türkçe ile öğrenin.",
  },
];

export function HowItWorks() {
  return (
    <Section id="nasil-calisir" eyebrow="3 adımda" title="Nasıl çalışır?" intro="Karmaşık menüler yok. Çek, gönder, öğren.">
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-extrabold text-on-primary">
                {i + 1}
              </span>
              <span className="text-3xl" aria-hidden="true">
                {s.icon}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
