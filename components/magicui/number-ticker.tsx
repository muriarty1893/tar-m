"use client"

// Adapted from Magic UI "NumberTicker" (MIT, magicui.design, listed on 21st.dev).
// Changes: Turkish number formatting, theme colours instead of black/white,
// shows the final value at once for prefers-reduced-motion, and the final
// value is exposed to assistive tech instead of the animating digits.
import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { cn } from "cn"

const fmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 })

export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 120 })
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      if (ref.current) ref.current.textContent = fmt.format(value)
      return
    }
    motionValue.set(value)
  }, [inView, motionValue, value, reduce])

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current && !reduce) ref.current.textContent = fmt.format(Math.round(latest))
      }),
    [spring, reduce],
  )

  return (
    <span className={cn("inline-block tabular-nums", className)}>
      <span ref={ref} aria-hidden="true">
        {reduce ? fmt.format(value) : "0"}
      </span>
      <span className="sr-only">{fmt.format(value)}</span>
    </span>
  )
}
