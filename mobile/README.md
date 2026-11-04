# Çiftçi Destek: mobile app

The Çiftçi Destek app for Android and iOS, built with Expo SDK 57 (React Native), in the look of the website's demo phone. It works on **the website's own data**: the same accounts (Clerk), Pazar listings, chats and offers, calendar, fields and news as https://tar-m-flame.vercel.app, through the website's API for the app (`app/api/app/…`, see `docs/accounts-and-market.md` on the website). A listing posted in the app is on the website at once, and the other way round.

The AI scan is still a **demo**: the camera, the diagnosis and the assistant chat run on the website demo's scripted scenarios, and every such screen says "Örnek". Weather is live (Open-Meteo). Prices are sample data, as on the website.

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

The app talks to the live website by default. To try it against a website running on your computer (`npm run dev` there), start it with `EXPO_PUBLIC_API_URL=http://<your computer's IP>:3000 npx expo start -c`.

`npx expo start --web` opens the same app in the browser (handy for checking screens; pop-up questions such as "Alan güncellensin mi?" only appear on phones, and Clerk's sign-up bot check may block automated browsers).

## Screens

| Tab | What it shows |
| --- | --- |
| **Ana sayfa** | The top bar (logo, "Dijital Tarım", the bell for unread chats, and the account chip: Hesabım, or "Giriş yap"), a sample sponsor banner and a "Reklam Vermek İçin Dokun" box, "Hızlı Menü Kısayolları" (ten tiles in two rows that scroll sideways, with Haberler and Hesabım), the live "Tarla Konumu" weather card, "Bu Hafta Tarlada", sample "Tarım Borsası Fiyatları" and "Pazarda yeni" (the newest real listings). |
| **Taramalar** | Opens the demo camera. |
| **Pazar** | The real market and its chats, switched at the top. "İlanlar": search (Turkish letters folded), Keşfet / Favoriler / İlanlarım, categories, province, sorting, 24 listings a page with more as you scroll; "İlan ver". "Mesajlar" (with the unread count): Tümü / Alıyorum / Satıyorum. The bell opens it on Mesajlar (`/pazar?bolum=mesajlar`). |
| **Takvim** | "Tarım takvimi": your own tasks by month (‹ › to move), the day's tasks with tick and delete, "İş ekle"; then "Geçmiş taramalar" (the demo scans, marked Örnek). |

Other screens:
- **Giriş yap / Hesap aç** (`giris`, `kayit`): the website's accounts. E-mail and password, or a 6-digit code by e-mail instead of the password, or Google. "Şifremi unuttum" sets a new password with an e-mailed code. Signing in from a new phone may ask for one more e-mailed code (Clerk's device check). Signing up asks the name other people see, the e-mail and a password (at least 15 characters: the Clerk setting), then the code.
- **Hesabım** (`hesap`): the name and home province, "Yönetim paneli" for admins, the website's e-mail and password settings, sign out, and deleting the account with everything in it (a box to tick first).
- **İlan** (`ilan/[id]`): photos (swipe), price, facts, description, the seller (member since, listings), safety tips. "Mesaj gönder" (ready questions or your own) and "Teklif ver" open the chat; once you have one, "Sohbete git". On your own listing: edit, mark sold / back on sale, remove. "İlanı şikâyet et". Admins can remove any listing.
- **İlan ver / İlanı düzenle** (`ilan/yeni`, `?id=` to edit): the website's form and checks, word for word. Photos (gallery or camera) are shrunk to 1600 px and uploaded as soon as they're picked; without one, the category's photo is shown as "Temsilî görsel".
- **Sohbet** (`mesajlar/[id]`): messages, offers, counter-offers, accept / turn down, "Görüldü"; checked for news every 4 s while open, the unread badge every 30 s.
- **Tarlalarım** (`tarlalar`), **a field** (`tarlalar/[id]`) and **Tarla ekle / düzenle** (`tarlalar/duzenle`): the season's area, expenses and expected yield; each field with its crop, stage, expenses (add, delete, cost per dönüm), upcoming tasks and its map outline.
- **Tarla Haritası** (`harita`): the fields outlined on a real satellite map (Esri World Imagery, with place names), named on the map; tap one for its card. Fields not drawn yet are listed with "çiz".
- **Sınır çiz** (`sinir/[id]`): tap the field's corners in order on the satellite map; the area is worked out as you go ("≈ 12,4 dönüm"), with "Son köşeyi sil" and "Temizle". After saving, the app offers to use the map's area as the field's. "Konumuma git" asks for approximate location only.
- **İş ekle** (`gorev`): what, which kind, the day (and time), and the field.
- **Haberler** (`haberler`, `haberler/[slug]`): the website's published news.
- **Yönetim paneli** (`yonetim`, admins only, as on /yonetim): the numbers; **Haberler** (`yonetim/haberler`, drafts first) and the **editor** (`yonetim/haber`, `?id=` to edit): title, address (from the title), summary, date, cover photo, Markdown text with a toolbar (heading, bold, italic, lists, quote, link) and "Önizleme", Taslak / Yayında, delete; **Şikâyetler** (`yonetim/sikayetler`): remove a reported listing or close its reports. The server checks the admin on every call.
- Unchanged: **Hava durumu** (`hava`), **Hava durumu konumu** (`konum`), **Borsa fiyatları** (`fiyatlar`, sample data), **Görsel kaynakları** (`kaynaklar`).

**The demo scan** (camera → sample photos → "Analiz ediliyor…" → result → "Soru sor"): as before, on the website demo's four scenarios (`src/domain/scenarios.ts`), now labelled "ÖRNEK" on the camera, "Örnek sonuç" with a note on the result, and "Örnek sohbet" in the assistant chat. These scans and their ticks are the only things kept on the phone (`src/state/store.ts`).

**What's live:** everything but the scan and prices comes from the website. The weather comes straight from Open-Meteo (free, no key; a forecast under 30 minutes old is reused, offline the last one is shown). Open-Meteo's free API and Esri's basemaps are for non-commercial use: a commercial launch needs their paid plans (or other providers).

**Ads.** The sponsor banner and the "advertise here" box show sample content (`src/domain/ads.ts`).

## Design and code

- **Look.** "Dijital Tarım": slate text on a pale page, white cards with hairline borders, emerald green, a dark green gradient for the weather card and bright tinted icon tiles (`TILE_TONES`), all in Plus Jakarta Sans, with Phosphor icons and the round badge logo (`assets/images/brand/logo.webp`, as on the website). The website's demo phone (`components/phone-app/` and `.demo-app`) uses the same look.
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
- **The data: the website's API.** `src/api/client.ts` calls `/api/app/…` on the website (`src/lib/config.ts`: `SITE_URL`, override with `EXPO_PUBLIC_API_URL`) with the Clerk session token; `src/api/queries.ts` holds the TanStack Query hooks and cache keys (lists stay fresh 30 s; chats poll every 4 s; polling pauses in the background), `src/api/actions.ts` the shared favourite toggle, `src/api/upload.ts` the photo upload. `src/api/types.ts` mirrors the website's types: change both together. A 409 `name_required` sends the person to Hesabım first, a 401 to Giriş (`src/lib/api-errors.ts`).
- **Sign-in.** `@clerk/expo` with the website's Clerk instance (the publishable key is in `src/lib/config.ts`, override with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`); the session token is kept in the phone's secure store. The forms are the app's own (`src/app/giris.tsx`, `kayit.tsx`, `src/components/auth/`), with Clerk's errors in Turkish (`src/lib/clerk-errors.ts`). The cache is cleared when the person changes.
- **The same rules as the website.** The forms check exactly what the server checks: `src/domain/market.ts` (listings), `fields.ts` (fields, expenses), `farm-calendar.ts` (tasks), `news.ts` (articles), `geo.ts` (outlines and area). The website's versions are `lib/market.ts`, `lib/farm.ts`, `lib/news.ts`, `lib/geo.ts`: change both together. `src/lib/form-errors.ts` merges the form's checks with the server's without counting cleared ones.
- **The map.** `src/components/dom/field-map-dom.tsx` is Leaflet in a DOM component, with Esri's satellite tiles. Its stylesheet is Leaflet's, minus the image rules (`leaflet.css`). The screens tell it how much their bars cover (`inset`), so the zoom buttons, the credits and fitted views stay clear of them.
- **The website's demo phone** (`components/phone-app/`, `data/demo-*.ts`) began as a copy of this app's sample data and is now its own: the app no longer has sample listings, chats or fields.
- **Routes** live in `src/app/` (Expo Router):
  - `(tabs)/`: Ana sayfa, Taramalar, Pazar, Takvim;
  - `giris`, `kayit`, `hesap`: accounts;
  - `ilan/[id]`, `ilan/yeni`, `mesajlar/[id]`: the market;
  - `tarlalar/`, `tarlalar/[id]`, `tarlalar/duzenle`, `harita`, `sinir/[id]`, `gorev`: fields, the map and tasks;
  - `haberler/`, `haberler/[slug]`: news;
  - `yonetim/`, `yonetim/haberler`, `yonetim/haber`, `yonetim/sikayetler`: the admin panel;
  - `hava`, `konum`, `fiyatlar`, `kaynaklar`: weather, prices, credits;
  - `tara`, `sonuc/[id]`, `soru/[id]`: the demo scan.
- **State on the phone.** One Zustand store (`src/state/store.ts`, saved with AsyncStorage) for the demo scans; the weather store for the province and the last forecast.

## Checks

```bash
npm test             # Jest: the forms' rules (market, fields, tasks, news, outlines), Clerk errors, scenarios, weather, dates, prices, credits
npm run typecheck
npx expo lint
npx expo-doctor
```

## Next steps

1. **The AI scan.** Send the photo to a plant-disease model on our server and return the same shape as `Scenario`; the screens stay the same.
2. **Push notifications** for new messages and offers (Expo Notifications), instead of the badge.
3. **Real market prices** from the exchanges.
4. **A Clerk production instance** once the website has its own domain (`docs/accounts-and-market.md`): then set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (or change the default in `src/lib/config.ts`).
5. **Release builds.** Build with EAS (`npx eas-cli build`). Publishing needs Google Play and Apple developer accounts.
