import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";
import { PLANS } from "@/data/plans";
import { buttonVariants } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";
import { CtaLink } from "./CtaLink";
import { Section } from "./Section";

/** "Planlar": three plans side by side; the popular one is set on the brand green and lifted. */
export function Pricing() {
  return (
    <Section
      id="planlar"
      eyebrow="Planlar"
      title="İşinize uygun bir plan seçin"
      intro="7 gün ücretsiz deneyin; kredi kartı gerekmez. Planlar ve fiyatlandırma kayıt sırasında netleşir."
    >
      <ul className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
        {PLANS.map((plan) => {
          const popular = !!plan.popular;
          return (
            <li
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7 sm:p-8",
                popular ? "border-transparent bg-panel text-panel-foreground shadow-lift lg:-my-4 lg:py-12" : "border-border bg-card",
              )}
            >
              {popular && (
                <p className="absolute -top-3.5 left-7 rounded-full bg-gold-soft px-3 py-1 text-sm font-semibold text-gold shadow-soft sm:left-8">
                  En popüler
                </p>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-5 flex items-baseline gap-1.5">
                {plan.price === null ? (
                  <span className="text-[2.6rem] font-bold leading-none tracking-tight">Size özel</span>
                ) : (
                  <>
                    <span className="text-[2.6rem] font-bold leading-none tracking-tight tabular-nums">₺{plan.price}</span>
                    <span className={popular ? "text-panel-foreground" : "text-muted-foreground"}>/ay</span>
                  </>
                )}
              </p>
              <p className={cn("mt-2 min-h-12", popular ? "text-panel-foreground" : "text-muted-foreground")}>{plan.audience}</p>

              <ul className={cn("mt-6 space-y-3 border-t pt-6", popular ? "border-panel-foreground/20" : "border-border")}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckIcon
                      aria-hidden="true"
                      weight="bold"
                      className={cn("mt-0.5 size-5 shrink-0", popular ? "text-panel-foreground" : "text-primary")}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.price === null ? (
                  <Link href="/is-birligi" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                    Teklif alın
                    <ArrowUpRight />
                  </Link>
                ) : (
                  <CtaLink
                    label="Ücretsiz dene"
                    ariaLabel={`Ücretsiz dene: ${plan.name}`}
                    className={cn("w-full", popular && "bg-panel-foreground text-panel shadow-none hover:bg-panel-foreground/90")}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-10 max-w-2xl text-muted-foreground">
        Fiyatlar güncellenebilir; kesin tutar kayıt ve ödeme adımında gösterilir. Sorularınız için{" "}
        <Link href="/#sorular" className="font-semibold text-primary underline underline-offset-4">
          bizimle iletişime geçin
        </Link>
        .
      </p>
    </Section>
  );
}
