# Çiftçi Destek: mobile app (prototype)

The Çiftçi Destek app for Android and iOS, built with Expo SDK 57 (React Native). It is the **website's demo phone made real**: the same screens, look and features as the demo on the home page, running on your phone. It is a prototype: the diagnosis and chat are scripted (the demo's scenarios), and there is no server, sign-in or payment yet.

## Try it on your phone

1. Install **Expo Go** from Google Play or the App Store. It must support SDK 57.
2. On the computer, in this folder:
   ```bash
   npm install
   npx expo start -c
   ```
3. Scan the QR code: with the Camera app on iPhone, or from inside Expo Go on Android. The phone and the computer must be on the same Wi-Fi.
   - On Linux with a firewall, open the port first: `sudo ufw allow 8081/tcp`.
   - If they can't share a Wi-Fi, use `npx expo start --tunnel`.

`npx expo start --web` opens the same app in the browser.

## Screens (as in the website demo)

| Tab | What it shows |
| --- | --- |
| **Ana sayfa** | Weather card over a field photo (Ayşe Yılmaz, Konya, 18,5°C), "Tarım Borsası Fiyatları" price cards, and "Hızlı İşlemler": Hastalık Tara, Tarlalarım, Tarla Haritası, Tarım Takvimi. |
| **Taramalar** | Opens the camera. |
| **Hava** | The weather card and the 5-day farm forecast. |
| **Takvim** | "Tarım takvimi": the month with task dots, the day's tasks with coloured kind tiles. Tasks can be ticked. |
| **Geçmiş** | "Geçmiş taramalar": past scans with their success percentage. Each one opens its result. |

**The scan flow:**
1. **Camera.** The live camera (CANLI · Kamera), with framing brackets, flash and flip.
2. **Sample photos.** The thumbnail opens the four demo fields, or the phone's gallery.
3. **Analysis.** "Analiz ediliyor…" with the demo's loader and checklist.
4. **Result.** The diagnosis, then the "Hasat başarı tahmini" gauge, "Ne görüyorum", and "Öneriler" that can be ticked.
5. **"Soru sor".** A chat with the agronomist assistant, with suggested questions.

**What's simulated:**
- **The result.** A photo is matched to one of the demo's four scenarios (`src/domain/scenarios.ts`), always the same one for the same photo. Without camera permission, the shutter uses the chosen sample.
- **Weather and prices.** They are the demo's values.
- **The calendar.** It is the demo month, placed around today.
- **"Tarlalarım", "Tarla Haritası" and "Tümünü gör".** They say "yakında" (coming soon), as they have no screen on the website either.

Scans, ticked suggestions and ticked tasks are saved on the phone.

## Design and code

- **Look.** The demo phone's palette ("Organik Doğa": white, deep green, gold), fonts (DM Sans and Space Grotesk) and Phosphor icons. They match `components/phone-app/` and `.demo-app` in the website.
- **Theme.** The tokens are in `src/global.css`, mirrored in `src/theme/tokens.ts`.
- **Components.** Ready-made [React Native Reusables](https://reactnativereusables.com) (shadcn/ui for React Native) in `src/components/ui/`, styled with [Uniwind](https://uniwind.dev) (Tailwind 4). The demo's loader ("Analyzing image") is ported in `src/components/app/analyzing-image.tsx`.
- **Routes** live in `src/app/` (Expo Router):
  - `(tabs)/` holds the five tabs;
  - `tara` is the camera and analysis;
  - `sonuc/[id]` is the result;
  - `soru/[id]` is the chat.
- **State.** One Zustand store (`src/state/store.ts`) holds it all, saved with AsyncStorage.

## Checks

```bash
npm test             # Jest: scenarios, calendar and forecast, dates, store
npm run typecheck
npx expo lint
npx expo-doctor
```

## Next steps toward a real app

1. **A real model.** Send the photo to a plant-disease model, served by our own API, and return the same shape as `Scenario`. The screens stay the same.
2. **Live data.** Live weather for the user's location, plus real market prices.
3. **Accounts and the empty cards.** Sign-in, plus screens for Tarlalarım and Tarla Haritası.
4. **Release builds.** Build with EAS (`npx eas-cli build`). Publishing needs Google Play and Apple developer accounts.
