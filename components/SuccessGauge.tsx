const R = 80;
const HALF = Math.PI * R;

function tone(value: number) {
  if (value < 50) return "text-red-600 dark:text-red-400";
  if (value < 75) return "text-accent";
  return "text-primary";
}

/** Half-circle gauge for the harvest success estimate (0-100). */
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
      className="flex flex-col items-center"
    >
      <svg viewBox="0 0 200 110" className="w-44" aria-hidden="true">
        <path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--line)" strokeWidth="16" strokeLinecap="round" />
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
      <p className="-mt-2 text-center font-bold">
        {label}: <span className={`text-2xl ${tone(v)}`}>%{v}</span>
      </p>
    </div>
  );
}
