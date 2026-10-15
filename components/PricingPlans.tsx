"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { CheckIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";
import { PLANS, yearlyMonthlyPrice } from "@/data/plans";
import { ArrowUpRight } from "@/components/ui/arrow-up-right";
import { CtaLink } from "./CtaLink";

type Period = "monthly" | "yearly";

const PRICE_FORMAT = { style: "currency", currency: "TRY", maximumFractionDigits: 0 } as const;
const priceText = new Intl.NumberFormat("tr-TR", PRICE_FORMAT);
const CONFETTI_COLORS = ["#0b7a3b", "#8f5a00", "#eef5f0", "#f5c542", "#15803d"];

// The quieter buttons on the side cards: a hairline outline, like the 21st.dev reference.
const SOFT_BUTTON =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--btn-radius)] border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30";

/**
 * The plan cards with a monthly / yearly switch (after the 21st.dev "pricing" component by Ravi
 * Katiyar): prices roll digit by digit to the new figure (NumberFlow), and switching to yearly
 * throws a little confetti from the switch — skipped, like all motion here, with reduced motion.
 */
export function PricingPlans() {
  const [period, setPeriod] = useState<Period>("monthly");
  const reduce = useReducedMotion() ?? false;
  const yearlyButton = useRef<HTMLButtonElement>(null);

  const choose = (next: Period) => {
    if (next === period) return;
    setPeriod(next);
    if (next !== "yearly" || reduce || !yearlyButton.current) return;
    const box = yearlyButton.current.getBoundingClientRect();
    import("canvas-confetti").then(({ default: confetti }) =>
      confetti({
        particleCount: 70,
        spread: 70,
        startVelocity: 32,
        ticks: 160,
        scalar: 0.9,
        colors: CONFETTI_COLORS,
        origin: { x: (box.left + box.width / 2) / window.innerWidth, y: (box.top + box.height / 2) / window.innerHeight },
        disableForReducedMotion: true,
      }),
    );
  };

  return (
    <>
      <div role="group" aria-label="Faturalandırma dönemi" className="mx-auto flex w-fit rounded-full bg-secondary p-1">
        {(["monthly", "yearly"] as const).map((p) => (
          <button
            key={p}
            ref={p === "yearly" ? yearlyButton : undefined}
            type="button"
            aria-pressed={period === p}
            onClick={() => choose(p)}
            className={cn(
              "relative min-h-11 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-6",
              period === p ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {period === p && (
              <motion.span
                layoutId="pricing-period"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-primary shadow-soft"
                transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative">
              {p === "monthly" ? (
                "Aylık plan"
              ) : (
                <>
                  Yıllık plan <span className="font-medium">(%20 indirim)</span>
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-14 grid items-start gap-8 lg:mt-16 lg:grid-cols-3 lg:gap-6">
        {PLANS.map((plan) => {
          const popular = !!plan.popular;
          const price = plan.price === null ? null : period === "yearly" ? yearlyMonthlyPrice(plan.price) : plan.price;
          return (
            <li
              key={plan.name}
              className={cn(
                "relative flex h-full flex-col rounded-2xl bg-card p-7 text-center sm:p-8",
                popular ? "border-2 border-primary shadow-lift lg:-mt-5 lg:mb-5" : "border border-border",
              )}
            >
              {popular && (
                <p className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-soft">
                  <StarIcon aria-hidden="true" weight="fill" className="size-4" />
                  En popüler
                </p>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.audience}</p>

              <div className="mt-7 flex min-h-14 items-baseline justify-center gap-1.5">
                {price === null ? (
                  <span className="text-[2.6rem] font-bold leading-none tracking-tight">Size özel</span>
                ) : (
                  <>
                    {/* Screen readers get the whole price; the rolling digits would be read one by one. */}
                    <span data-price className="sr-only">
                      {priceText.format(price)} / ay
                    </span>
                    <NumberFlow
                      aria-hidden="true"
                      value={price}
                      locales="tr-TR"
                      format={PRICE_FORMAT}
                      className="text-[2.9rem] font-bold leading-none tracking-tight"
                    />
                    <span aria-hidden="true" className="text-sm font-semibold text-muted-foreground">
                      / ay
                    </span>
                  </>
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {price === null ? "Üye sayısına göre teklif" : period === "yearly" ? "Yıllık faturalandırılır" : "Aylık faturalandırılır"}
              </p>

              <ul className="mt-7 space-y-3 text-left text-[0.95rem]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-muted-foreground">
                    <CheckIcon aria-hidden="true" weight="bold" className="mt-0.5 size-5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.price === null ? (
                  <Link href="/is-birligi" className={SOFT_BUTTON}>
                    Teklif alın
                    <ArrowUpRight />
                  </Link>
                ) : popular ? (
                  <CtaLink label="Ücretsiz dene" ariaLabel={`Ücretsiz dene: ${plan.name}`} className="w-full" />
                ) : (
                  <CtaLink label="Ücretsiz dene" ariaLabel={`Ücretsiz dene: ${plan.name}`} variant="text" className={SOFT_BUTTON} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
