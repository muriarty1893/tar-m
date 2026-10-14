import { HandPointingIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "cn";

/**
 * Coach mark for the demo: a 3D hand that taps a spot on the app screen, a ring that pulses on
 * each tap, and a short label. It is part of the app screen's DOM, so on the 3D phone it is
 * warped onto the display with everything else. Decorative (the steps are also written beside
 * the phone) and never blocks a tap. Under reduced motion the hand rests on the target.
 *
 * Place it with `className` (absolute left/top = the fingertip's target); `flip` brings the hand
 * in from the bottom-left instead of the bottom-right, for targets near the right edge.
 */
export function TapHint({ label, className, flip = false }: { label: string; className?: string; flip?: boolean }) {
  return (
    <span data-testid="tap-hint" aria-hidden="true" className={cn("pointer-events-none absolute z-30 size-0", className)}>
      <span className="tap-ring absolute -left-8 -top-8 size-16 rounded-full border-[3px] border-gold bg-gold/15" />
      <span className="tap-ring tap-ring--late absolute -left-8 -top-8 size-16 rounded-full border-2 border-gold" />
      <span className={cn("tap-hand absolute top-0 block size-14", flip ? "tap-hand--flip -left-[38px]" : "-left-[30px]")}>
        {/* Contact shadow on the glass: tightens as the finger presses. */}
        <span className="tap-shadow absolute left-1/2 top-[62%] h-4 w-9 -translate-x-1/2 rounded-[50%] bg-black/35 blur-[5px]" />
        <HandPointingIcon
          weight="fill"
          className={cn(
            "relative size-14 text-white [filter:drop-shadow(0_0_1px_rgb(0_0_0/0.85))_drop-shadow(0_0_0.5px_rgb(0_0_0/0.85))_drop-shadow(0_10px_10px_rgb(0_0_0/0.35))]",
            flip && "-scale-x-100",
          )}
        />
      </span>
      <span
        className={cn(
          "absolute top-[66px] whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 font-heading text-[13px] font-bold text-background shadow-lift ring-2 ring-gold",
          flip ? "right-[-6px]" : "left-[-6px]",
        )}
      >
        {label}
      </span>
    </span>
  );
}
