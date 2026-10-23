# 3D phone showcase

The demo section (`#demo`) shows the app running on a 3D phone that floats above a small meadow.

## Pieces

- `components/phone-app/AppScreen.tsx`: the simulated app (home, camera scan, result). It is plain React DOM, 340×738 px.
- `components/phone-app/PhoneStage.tsx`: loads the 3D scene only when the demo nears the viewport, and only with WebGL and without Save-Data. Until then, or when 3D isn't available, the same `AppScreen` sits in a flat phone frame.
- `components/phone-app/PhoneScene.tsx`: three.js scene (React Three Fiber + drei). Each frame it projects the display's four corners and warps the DOM screen onto them with a CSS `matrix3d` (`quadMatrix3d` in `lib/phone-stage.ts`), so the screen stays real, accessible, clickable HTML.
- `components/phone-app/GrassField.tsx`: procedural meadow (instanced grass, wheat and flowers with a wind shader). No download needed.

Flow: picking a field photo (or "Hastalık Tara" on the phone) opens the live camera; the shutter on the phone, or the large "Fotoğrafı çek ve analiz et" button beside it, takes the photo and starts the 2 s analysis. On the result, "Soru sor" opens a scripted chat: each scenario's suggested questions (`questions` in `data/demo-scenarios.ts`, to be reviewed by an agronomist like the rest of the demo text) and a free-text box that explains it is a demo.

When a field photo is picked, that photo fills the stage behind the phone (blurred, with a vignette) and the meadow hides, so the phone looks like it is standing in the field; its camera screen shows the same scene zoomed in, with a slight handheld drift and a CANLI label. Resetting brings the meadow back.

The phone's bottom bar works: Ana sayfa, Taramalar (starts a scan), Hava (5-day farm forecast) and Geçmiş (past scans; tap one to open its result).

Motion: the phone turns in once, then floats. "Hareketi durdur" pauses it. With `prefers-reduced-motion` there is no intro, no float and no automatic example scan.

## The phone model

Source: “iPhone 17 Pro” by Ranguel, https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec, licensed CC BY 4.0. The credit is shown under the demo; keep it there.

The original file (`iphone_17_pro.glb`, 9 MB, not committed) was compressed to `public/models/phone.glb` (about 1 MB) with:

```bash
npx @gltf-transform/cli@4 optimize iphone_17_pro.glb public/models/phone.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --simplify false
```

The scene finds the display by its material name `OLED`, so keep that name if you swap the model.

## The home hero

`components/ui/cinematic-landing-hero.tsx` (adapted from a 21st.dev cinematic hero) plays a one-time GSAP intro on load and then rests; there is no scroll pinning. The headline reveals over a field running to the horizon (`public/hero/field-horizon.webp`). Then a forest-green card rises with the phone render (mouse tilt on desktop), two glass badges, the pitch and the CTAs. An inline `<head>` script in `app/layout.tsx` adds `html.cine` only when motion is allowed, so intro elements start hidden only then. Without JS, with reduced motion, or if the hero hasn't started within 4 s, everything shows in its final state. GSAP is loaded lazily after first paint.

## The hero image

`public/hero/phone.webp` is a cinematic still of the bare phone (no meadow, transparent background) on the app's home screen. To re-render it after changing the app screens:

1. Add a temporary client page that renders `PhoneScene` with `scenery={false}`, `animate={false}`, `intro={false}`, `pose={[-0.12, -0.32, 0.035]}` and `view={{ fov: 24, position: [0, -0.3, 4.5], lookAt: [0, 0, 0] }}`, plus `AppScreen` in the overlay div (as `PhoneStage` does), in a 700×1000 box. Load `AppScreen` with `next/dynamic` and `ssr: false`: its demo clock (`lib/demo-clock.ts`) reads the time, which the build refuses to prerender.
2. Run `npm run dev` (or `npm run build && npm start`). In Playwright (Chromium with `--use-angle=gl`, 2× device scale), make the page background transparent and screenshot the canvas with `omitBackground: true`.
3. Trim and convert: `magick render.png -trim +repage -bordercolor none -border 24 -resize 760x -quality 84 public/hero/phone.webp`
4. Delete the temporary page.

## Photos

The demo and in-app photos come from Wikimedia Commons. Each one, with its author and licence, is listed in `data/photo-credits.ts` and credited under the demo. A unit test fails if a photo in `public/demo` or `public/app` has no credit.
