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

## Screens

| Tab | What it shows |
| --- | --- |
| **Ana sayfa** | Live weather card over a field photo (Ayşe Yılmaz, the province, temperature, today's farming hint) with the messages button and "7 günlük tahmin", "Tarım Borsası Fiyatları" price cards, "Hızlı İşlemler" (Hastalık Tara, Tarlalarım, Tarla Haritası, Tarım Takvimi), and "Pazarda yeni" listings. |
| **Taramalar** | Opens the camera. |
| **Pazar** | The farmers' market: search, Keşfet / Favoriler / İlanlarım, categories (Ürün, Tohum & Gübre, Alet, Ekipman, Araç) and the listings. "İlan ver" posts one. |
| **Takvim** | "Tarım takvimi": the month with task dots, the day's tasks with coloured kind tiles. Tasks can be ticked. |
| **Geçmiş** | "Geçmiş taramalar": past scans with their success percentage. Each one opens its result. |

Screens that open from Ana sayfa:
- **Hava durumu** (`hava`): live weather and a 7-day forecast from [Open-Meteo](https://open-meteo.com), each day with a farming hint (frost, heavy rain, a spraying window). Pull down to refresh.
- **Hava durumu konumu** (`konum`): the place chip on the weather card opens it. Pick one of the 81 provinces, or "Konumumu kullan" for the nearest one; location permission is asked only then, and only approximate location.
- **Borsa fiyatları** (`fiyatlar`): every crop's price per kilo, from "Tümünü gör" on the price cards. It has search (by crop or exchange), groups (Tahıl, Baklagil, Yağlı tohum, Meyve & sebze, Sanayi bitkisi), and sorting A–Z or by largest change.
- **Tarlalarım** (`tarlalar`): this season's area, expenses and expected yield, then each field with its health, last scan and next calendar task. A field's page shows its expenses by kind, its upcoming tasks and a link to its last scan.
- **Tarla Haritası** (`harita`): the fields outlined on a top-down photo, tinted and labelled by plant health (Sağlıklı, İzlenmeli, Riskli). Tap a field or its name for its plant-health index.
- **Görsel kaynakları** (`kaynaklar`): the credits for every photo, component, icon and font, linked from the bottom of Ana sayfa.

**The scan flow:**
1. **Camera.** The live camera (CANLI · Kamera), with framing brackets, flash and flip.
2. **Sample photos.** The thumbnail opens the four demo fields, or the phone's gallery.
3. **Analysis.** "Analiz ediliyor…" with the demo's loader and checklist.
4. **Result.** The diagnosis, then the "Hasat başarı tahmini" gauge, "Ne görüyorum", and "Öneriler" that can be ticked.
5. **"Soru sor".** A chat with the agronomist assistant, with suggested questions.

**The market (Pazar) and messages:**
1. **A listing.** Photo, price (with unit for produce), facts, specs, description, the seller (rating, reply time, verified phone) and safety tips. "Mesaj gönder" opens a chat; "Teklif ver" sends an offer. On your own listing: "Satıldı olarak işaretle" and remove.
2. **İlan ver.** Photos (gallery or camera; without one, the category's photo is used and marked "Temsilî görsel"), title, category, condition, price and unit, quantity, location, description, "Pazarlık payı var". Checked on blur and on submit, with a summary of what to fix.
3. **Mesajlar.** Every listing chat (Tümü / Alıyorum / Satıyorum), unread ones in bold with a count; the count also shows on the home card and in Pazar.
4. **A chat.** The listing pinned on top, quick replies, offers and counter-offers you can accept or turn down, and a typing indicator.

The design follows the ui-ux-pro-max marketplace pattern (search first, categories in view, trust cues, "list your item" always at hand) in the app's own look: see `docs/superpowers/specs/2026-10-17-pazar-mesajlar-design.md`.

**What's simulated:**
- **The result.** A photo is matched to one of the demo's four scenarios (`src/domain/scenarios.ts`), always the same one for the same photo. Without camera permission, the shutter uses the chosen sample.
- **The calendar.** It is the demo month, placed around today.
- **The fields.** Ayşe's four fields, their expenses and their plant-health index are sample data (`src/domain/fields.ts`). A field's health comes from its last scan's harvest-success estimate, on the gauge's scale. The map is an example photo, not Konya.
- **Prices.** The 14 crops' prices and trends are sample data (`src/domain/prices.ts`).
- **The market.** The 15 listings and their sellers are sample data (`src/domain/market.ts`). The other side of a chat answers by script (`src/domain/chat.ts`): by topic for questions; offers at 92 % of the price or more are accepted, under 60 % turned down, and the rest countered halfway.

Scans, ticks, favourites, your listings, the chats, the chosen province and the last forecast are saved on the phone.

**What's live:** the weather. Open-Meteo is free and needs no key or server, so the phone calls it directly (`src/domain/weather.ts`, `src/state/weather.ts`). A forecast under 30 minutes old is reused; offline, the last one is shown with its time. The farming hints use the website's thresholds and still need an agronomist's review. Open-Meteo's free API is for non-commercial use: a commercial launch needs one of its paid plans.

## Design and code

- **Look.** The demo phone's palette ("Organik Doğa": white, deep green, gold), fonts (DM Sans and Space Grotesk) and Phosphor icons. They match `components/phone-app/` and `.demo-app` in the website.
- **Theme.** The tokens are in `src/global.css`, mirrored in `src/theme/tokens.ts`.
- **The website's components, copied unchanged.** These are the same files as on the website, byte for byte, run through [Expo DOM components](https://docs.expo.dev/guides/dom-components/) (`'use dom'`, a built-in web view):
  - React Bits **SpringCheck** (`src/components/ui/spring-check.tsx`);
  - the Magic UI **NumberTicker** (`src/components/magicui/number-ticker.tsx`);
  - the shadcn/recharts half-donut **SuccessPie** with `chart.tsx`;
  - the 21st.dev **"Analyzing image"** loader (`src/components/ui/analyzing-image.tsx`);
  - `SuccessGauge`, with one change: Next.js's `dynamic()`, which only exists in Next.js, is replaced by plain imports.

  Their styles (`src/components/dom/demo.css`) are copied verbatim from the website's `app/globals.css`. The wrappers in `src/components/dom/` place them as the demo does: the "Öneriler" list, the calendar task list, the gauge and the loader.

  In Expo Go, these run in `react-native-webview`, not Expo's default web view (`@expo/dom-webview`): Expo Go 57 doesn't include the default one, and mounting one crashed the app. On Android, `src/components/dom/use-dom-height.ts` also works around a startup race in that web view that left the components blank.
- **Other components.** Ready-made [React Native Reusables](https://reactnativereusables.com) (shadcn/ui for React Native) in `src/components/ui/`, styled with [Uniwind](https://uniwind.dev) (Tailwind 4).
- **Keep the copies in step with the website.** If one of the website's components changes, copy the file over again: they are meant to stay identical.
- **Routes** live in `src/app/` (Expo Router):
  - `(tabs)/` holds the five tabs;
  - `hava` is the forecast;
  - `fiyatlar` is the price list;
  - `tarlalar/` and `tarlalar/[id]` are the fields and a field;
  - `harita` is the field map;
  - `kaynaklar` is the credits;
  - `ilan/[id]` and `ilan/yeni` are a listing and the new-listing form;
  - `mesajlar/` and `mesajlar/[id]` are the inbox and a chat;
  - `tara` is the camera and analysis;
  - `sonuc/[id]` is the result;
  - `soru/[id]` is the chat.
- **State.** One Zustand store (`src/state/store.ts`) holds it all, saved with AsyncStorage.

## Checks

```bash
npm test             # Jest: scenarios, calendar and forecast, dates, market, chat, store, fields, prices, credits
npm run typecheck
npx expo lint
npx expo-doctor
```

## Next steps toward a real app

1. **A real market.** Listings, photos and chats on a server with sign-in, push notifications for messages, and moderation and reporting. The screens keep their shape (`Listing`, `Conversation`).
2. **A real model.** Send the photo to a plant-disease model, served by our own API, and return the same shape as `Scenario`. The screens stay the same.
3. **Real market prices.** A source for the exchanges' daily prices (likely collected by our server).
4. **Accounts and real fields.** Sign-in, fields drawn on a real map, satellite plant-health data, and expenses the farmer enters.
5. **Release builds.** Build with EAS (`npx eas-cli build`). Publishing needs Google Play and Apple developer accounts.
