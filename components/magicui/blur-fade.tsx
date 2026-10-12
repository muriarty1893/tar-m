"use client"

// Adapted from Magic UI "BlurFade" (MIT, magicui.design, listed on 21st.dev).
// Changes: reveals once when scrolled into view, and renders the final state
// immediately for prefers-reduced-motion. Use below the fold only: content is
// hidden until JavaScript runs, which would hurt LCP above the fold.
import { useRef, type ReactNode } from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

interface BlurFadeProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  offset?: number
}

export function BlurFade({ children, className, delay = 0, duration = 0.45, offset = 14 }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduce = useReducedMotion()

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offset, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
