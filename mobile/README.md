# Çiftçi Destek: mobile app (prototype)

The Çiftçi Destek app for Android and iOS, built with Expo (React Native). It is a **clickable prototype**: every screen works and saves what you do on the phone, but it runs on sample data. There is no real AI model, server, sign-in or payment yet.

## Try it on your phone

1. Install **Expo Go** from Google Play or the App Store.
2. On the computer, in this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code in the terminal: with the Camera app on iPhone, or from inside Expo Go on Android. The phone and the computer must be on the same Wi-Fi. If they are not, run `npx expo start --tunnel` instead.

`npx expo start --web` opens the same app in the browser.

## What's inside

| Screen | What it does |
| --- | --- |
| Hoş geldin → Ürünler → Konum | Three-step setup: crops you grow, province and district. "Zaten hesabım var" skips it with the sample profile. |
| **Tara** (centre button) | Camera with crop chips, flash, gallery, and sample photos (the ? button) for trying it without a diseased plant. |
| Analiz ediliyor → Teşhis | A scan line sweeps the photo, then the diagnosis: disease, confidence, severity, spread, numbered steps (chemical and organic), the best spraying window from the weather, **Takvime ekle**, **Uzmana sor**, **Paylaş**, **Yeniden tara**. Healthy plants get their own result. |
| Bugün | Greeting, weather with a plain "can I spray today?" verdict and the next good window, frost and regional disease warnings, today's tasks, shortcuts. |
| Tarlalar → Tarla detayı | Fields with health, a scan-history timeline and upcoming tasks; "Bu tarlayı tara". |
| Takvim | Month view with task dots, tasks per day, add a task. Treatments added from a diagnosis appear here. |
| Profil | Plans (monthly / yearly), settings (offline mode, notifications, read answers aloud), scan history, image credits, reset the demo. |
| Hal fiyatları | Sample market prices for your crops with a week's trend. |
| Sesli asistan | Ask by holding the mic or typing; answers are read aloud in Turkish and link to the right screen. |

**What's simulated:**
- **The diagnosis.** It comes from `src/domain/diagnosis.ts`: a sample photo gives its known result, and a real photo gives a stable, plausible result for the chosen crop.
- **The data.** Weather, market prices and the regional warning are sample data.
- **Voice input.** Speech-to-text needs a native module that Expo Go doesn't include, so releasing the mic button "hears" a sample question.

## Design and code

- **Design.** The four core screens (welcome, camera, analysing, result) and the colour and type theme come from the Sleek design in `../design/sleek/` (the HTML is in `../design/sleek/html/`). The other screens extend the same system.
- **Screenshots** of every screen are in `../design/app/`.
- **Components.** Ready-made [React Native Reusables](https://reactnativereusables.com) (shadcn/ui for React Native) in `src/components/ui/`, styled with [Uniwind](https://uniwind.dev) (Tailwind 4).
- **Theme.** The tokens are in `src/global.css`, mirrored in `src/theme/tokens.ts`. The fonts are Bricolage Grotesque and Atkinson Hyperlegible Next. The icons are the Solar set (CC BY 4.0), the same set the Sleek design uses.
- **Routes** live in `src/app/` (Expo Router):
  - `(tabs)/` holds the five tabs;
  - `tara`, `analiz` and `teshis/[id]` form the scan flow;
  - `tarla/[id]`, `hal-fiyatlari`, `asistan`, `gecmis` and `kaynaklar` are pushed screens.
- **State.** One Zustand store (`src/state/store.ts`) holds it all, saved on the device with AsyncStorage.
- **Logic** lives in `src/domain/`, covered by tests.

## Checks

```bash
npm test             # Jest: formatting, weather/spraying, diagnosis, assistant, store
npm run typecheck
npx expo lint
npx expo-doctor
```

## Next steps toward a real app

1. **A real model.** Send the photo to a plant-disease model, served by our own API, then replace `diagnose()`.
2. **Live data.** Live weather for the field's location, real market prices, and real regional outbreak reports.
3. **Accounts and sync.** Sign-in, plus syncing fields, tasks and scans to a server.
4. **Release builds.** Build with EAS (`npx eas-cli build`). Publishing needs a Google Play developer account and an Apple Developer account.
