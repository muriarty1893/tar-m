"use client"

// Adapted from Magic UI "BlurFade" (MIT, magicui.design, listed on 21st.dev).
// Same blur + fade-up reveal, rebuilt on CSS transitions + IntersectionObserver
// so the landing page does not ship an animation library up front.
// Progressive enhancement:
// - Server HTML is fully visible, so content shows without JavaScript, for
//   crawlers, and on slow phones before hydration.
// - After hydration, only blocks still below the viewport are hidden (off-screen)
//   and revealed when scrolled into view.
// - prefers-reduced-motion: never hides or animates.
import { useEffect, useRef, useState, type ReactNode } from "react"

type Phase = "static" | "hidden" | "shown"

export function BlurFade({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>("static")

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top <= window.innerHeight) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("shown")
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    )
    const id = requestAnimationFrame(() => {
      setPhase("hidden")
      io.observe(el)
    })
    return () => {
      cancelAnimationFrame(id)
      io.disconnect()
    }
  }, [])

  const style =
    phase === "hidden"
      ? { opacity: 0, transform: "translateY(14px)", filter: "blur(6px)" }
      : phase === "shown"
        ? {
            opacity: 1,
            transform: "none",
            filter: "blur(0px)",
            transition: `opacity 450ms ease-out ${40 + delay * 1000}ms, transform 450ms ease-out ${40 + delay * 1000}ms, filter 450ms ease-out ${40 + delay * 1000}ms`,
          }
        : undefined

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
