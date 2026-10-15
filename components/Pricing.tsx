import Link from "next/link";
import { Starfield } from "@/components/ui/starfield";
import { PricingPlans } from "./PricingPlans";
import { Section } from "./Section";

/** "Planlar": a monthly / yearly switch over three plans, on a faint starfield. */
export function Pricing() {
  return (
    <Section
      id="planlar"
      eyebrow="Planlar"
      title="İşinize uygun bir plan seçin"
      intro="7 gün ücretsiz deneyin; kredi kartı gerekmez. Planlar ve fiyatlandırma kayıt sırasında netleşir."
      align="center"
      className="overflow-hidden"
      backdrop={<Starfield />}
    >
      <PricingPlans />
      <p className="mx-auto mt-12 max-w-2xl text-center text-muted-foreground">
        Fiyatlar güncellenebilir; kesin tutar kayıt ve ödeme adımında gösterilir. Sorularınız için{" "}
        <Link href="/#sorular" className="font-semibold text-primary underline underline-offset-4">
          bizimle iletişime geçin
        </Link>
        .
      </p>
    </Section>
  );
}
