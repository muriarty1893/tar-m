import { NumberTicker } from "@/components/magicui/number-ticker";

const R = 80;
const HALF = Math.PI * R;

function tone(value: number) {
  if (value < 50) return "text-destructive";
  if (value < 75) return "text-gold";
  return "text-primary";
}

/** Half-circle gauge for the harvest success estimate (0-100); the number counts up (Magic UI NumberTicker). */
export function SuccessGauge({ value, label = "Hasat başarı tahmini" }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-valuetext={`%${v}`}
      className="flex flex-col items-center rounded-2xl bg-secondary/60 px-4 pb-3 pt-4"
    >
      <svg viewBox="0 0 200 110" className="w-40" aria-hidden="true">
        <path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--muted)" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M20 100a80 80 0 0 1 160 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(HALF * v) / 100} ${HALF}`}
          className={`${tone(v)} motion-safe:transition-[stroke-dasharray] motion-safe:duration-700`}
        />
      </svg>
      <p className="-mt-3 text-center text-sm font-semibold">
        {label}:{" "}
        <span className={`font-heading text-2xl font-bold ${tone(v)}`}>
          %<NumberTicker value={v} />
        </span>
      </p>
    </div>
  );
}
