# Bereket AI Redesign Implementation Plan

> Executed inline (native). Spec: `docs/superpowers/specs/2026-10-12-bereket-ai-redesign-design.md`

**Goal:** Re-skin and restructure every page in the Organik Doğa direction with shadcn/ui, Magic UI and Phosphor, keeping behavior and tests.

## Global Constraints

Spec "Constraints kept" section applies to every task. Run `npm test && npm run e2e && npm run lint` after each task.

## Review Focus

- Hidden-until-JS content (BlurFade) above the fold → blank hero on slow phones / bad LCP.
- Radix Sheet/Accordion changing accessible names or ids the tests and screen readers rely on.
- Dark mode contrast of new tokens on every component (axe light+dark).
- Bundle growth from motion/Radix pushing Lighthouse performance under 90.
- Turkish glyphs in Space Grotesk/DM Sans (ş ğ ı İ) at all weights used.

### Task 1: Foundation
shadcn init (components.json, `lib/utils.ts` `cn`), deps (`@phosphor-icons/react`, `motion`), shadcn primitives (button card input label checkbox textarea accordion sheet badge separator), Magic UI files under `components/magicui/`, new tokens + fonts in `app/globals.css` / `app/layout.tsx`. Test: existing suites pass; new unit test that no component source contains emoji characters (RED first).

### Task 2: Shell
Header (Sheet mobile menu), Footer, Logo, CtaLink → shadcn Button styles. Tests: smoke + header tests stay green.

### Task 3: Landing
Hero, HowItWorks, Features (BentoGrid), Section, PartnerCta, page composition with BlurFade below the fold. Tests: pages.spec section order, CTA count.

### Task 4: Interactive widgets
DemoShowcase (+ NumberTicker gauge), WeatherWidget, WaitlistForm, PartnerForm on shadcn Card/Input/Label/Checkbox/Textarea. Tests: demo, weather, forms specs.

### Task 5: Subpages
/haberler, article, /hava, /is-birligi, /sss (Accordion), /hakkimizda, /gizlilik, 404. FAQ test updated from `<details>` to accordion buttons (same assertions: ≥6 questions, expands).

### Task 6: Verify
Lighthouse mobile ≥90 ×4 on main pages, axe clean, screenshots light/dark/mobile reviewed, OG image retheme, docs update, final fresh review.
