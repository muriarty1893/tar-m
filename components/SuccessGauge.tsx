"use client";

import dynamic from "next/dynamic";

// The chart (recharts) and the Magic UI NumberTicker (Motion) load only when a gauge is actually
// shown, i.e. after a demo answer appears — not on page load. The placeholder keeps the same size.
const SuccessPie = dynamic(() => import("./SuccessPie").then((m) => m.SuccessPie), {
  ssr: false,
  loading: () => <div className="h-[112px] w-[224px]" />,
});
const NumberTicker = dynamic(() => import("@/components/magicui/number-ticker").then((m) => m.NumberTicker), {
  ssr: false,
  loading: () => null,
});

function tone(value: number) {
  if (value < 50) return { text: "text-destructive", color: "var(--destructive)" };
  if (value < 75) return { text: "text-gold", color: "var(--gold)" };
  return { text: "text-primary", color: "var(--primary)" };
}

/** Half-donut chart for the harvest success estimate (0-100); the number counts up (Magic UI NumberTicker). */
export function SuccessGauge({ value, label = "Hasat başarı tahmini" }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const t = tone(v);
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-valuetext={`%${v}`}
      className="flex flex-col items-center rounded-2xl bg-secondary/60 px-4 pb-3 pt-3"
    >
      <div className="relative" aria-hidden="true">
        <SuccessPie value={v} tone={t.color} />
        <span className={`absolute inset-x-0 bottom-0 flex justify-center font-heading text-[28px] font-bold leading-none ${t.text}`}>
          %<NumberTicker value={v} />
        </span>
      </div>
      <p className="mt-1.5 text-center text-sm font-semibold">{label}</p>
    </div>
  );
}
