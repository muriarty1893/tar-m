# Bereket AI — Visual Redesign

Date: 2026-10-12
Status: Approved by user (direction + component stack); user asked to build end-to-end without per-step review.
Builds on: `2026-10-12-bereket-ai-website-design.md` (all features, copy, behavior and tests stay).

## Goal

Rebuild every page's UI from scratch in the "Organik Doğa" (Organic Biophilic) direction, chosen from UI UX Pro Max design-system results, using free React components (shadcn/ui, Magic UI, Phosphor icons). Functionality is unchanged.

## Design system (from UI UX Pro Max: Agriculture/Farm Tech palette + Organic Biophilic style)

| Token | Light | Dark |
|---|---|---|
| primary | #15803D | #4ADE80 |
| on-primary | #FFFFFF | #052E16 |
| secondary | #22C55E | #22C55E |
| accent (harvest gold) | #A16207 | #EAB308 |
| on-accent | #FFFFFF | #1A1405 |
| background | #F0FDF4 | #0C1A11 |
| foreground | #14532D | #E3F4E7 |
| card | #FFFFFF | #13261A |
| muted | #E8F0F1 | #18301F |
| muted-foreground | #475569 | #A7C4AF |
| border | #BBF7D0 | #1F3D29 |
| destructive | #DC2626 (text #B91C1C) | #F87171 |
| ring | #15803D | #4ADE80 |

All text pairs verified ≥ 4.5:1 (lowest: primary on background, 4.79).

- **Type:** Space Grotesk (headings, 500–700) + DM Sans (body 400/500/700), both via `next/font` with `latin-ext` (Turkish). Body 18px, line-height 1.6.
- **Shape:** radius 16–24px, organic blob shapes behind sections, soft green-tinted shadows, CSS dot pattern texture.
- **Icons:** Phosphor (duotone/regular). No emoji anywhere in the UI.
- **Motion:** 150–300ms hover/press; Magic UI BlurFade for below-the-fold section reveals; NumberTicker for the demo success rate. Everything honours `prefers-reduced-motion` (final state shown immediately).
- **Touch:** interactive targets ≥ 48px tall, ≥ 8px apart.

## Component sources

| Need | Source |
|---|---|
| Button, Card, Input, Label, Checkbox, Textarea, Accordion (FAQ), Sheet (mobile menu), Badge, Separator | shadcn/ui (MIT) via `npx shadcn@latest add` |
| BlurFade, NumberTicker, BentoGrid (adapted) | Magic UI (MIT), public registry `magicui.design/r/*` — also listed on 21st.dev |
| Icons | `@phosphor-icons/react` (MIT) |
| Animation runtime | `motion` (MIT), required by Magic UI |

21st.dev's own installer needs a 21st API key; components were taken from the same libraries' public registries instead. Adaptations: BentoCard CTA always visible (no hover-only), NumberTicker uses `tr-TR` formatting and tokens, DotPattern re-implemented in CSS (no per-dot JS).

## Pages (same routes and sections as before)

- **Header:** sticky, translucent; desktop nav + CTA; mobile uses shadcn Sheet (keeps `Menüyü aç` name and `#mobil-menu` id; CTA closes it).
- **Landing:** organic hero with phone mockup and blob; 3-step "Nasıl çalışır?" with connected steps; "Neler yapabilir?" as a bento grid (6 cells); demo; weather teaser; latest news; partner CTA; waitlist card; footer.
- **Subpages** (`/haberler`, `/haberler/[slug]`, `/hava`, `/is-birligi`, `/sss`, `/hakkimizda`, `/gizlilik`, 404) share a page-hero header style; FAQ uses shadcn Accordion.

## Constraints kept from the original spec

All visible text Turkish; brand only via `siteConfig.name`; CTA label "Erken erişim için kaydol"; demo disclaimer verbatim; KVKK consent; no zod in initial bundle; CLS < 0.1; Lighthouse mobile ≥ 90 in all four categories; axe wcag2a/aa clean light and dark; all existing tests pass (updated only where markup changes, never weakened).
