# 3D phone showcase

The demo section (`#demo`) shows the app running on a 3D phone that floats above a small meadow.

## Pieces

- `components/phone-app/AppScreen.tsx`: the simulated app (home, camera scan, result). It is plain React DOM, 340×738 px.
- `components/phone-app/PhoneStage.tsx`: loads the 3D scene only when the demo nears the viewport, and only with WebGL and without Save-Data. Until then, or when 3D isn't available, the same `AppScreen` sits in a flat phone frame.
- `components/phone-app/PhoneScene.tsx`: three.js scene (React Three Fiber + drei). Each frame it projects the display's four corners and warps the DOM screen onto them with a CSS `matrix3d` (`quadMatrix3d` in `lib/phone-stage.ts`), so the screen stays real, accessible, clickable HTML.
- `components/phone-app/GrassField.tsx`: procedural meadow (instanced grass, wheat and flowers with a wind shader). No download needed.

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

## The hero image

`public/hero-phone.webp` is a render of this scene: the phone on the app's home screen above the meadow, on a transparent background. To re-render it after changing the app screens:

1. Run `npm run dev`.
2. In Playwright (Chromium with `--use-angle=gl`, 2× device scale, reduced motion so the phone is still), open `/#demo`, make the page and `.stage-bg` backgrounds transparent, and screenshot a 520×820 area centred on the phone with `omitBackground: true`.
3. Fade the meadow's edges and convert:
   `magick render.png -resize 880x -channel A -fx "u*min(1,min((h-j)/190,min(i/140,(w-i)/140)))" +channel -quality 82 public/hero-phone.webp`

## Photos

The demo and in-app photos come from Wikimedia Commons. Each one, with its author and licence, is listed in `data/photo-credits.ts` and credited under the demo. A unit test fails if a photo in `public/demo` or `public/app` has no credit.
