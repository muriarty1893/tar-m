# Çiftçi Destek mobile app: design record

Date: 2026-10-16 · Status: prototype in `mobile/`, rebuilt after feedback

## Agreed with the owner

**Platforms and scope**
- One app for Android and iOS.
- The first version is a **clickable prototype on sample data**: no real AI, sign-in, server or payments.

**Design**
- **First version (Sleek "Toprak" theme).** It was built from four Sleek-designed screens plus extra features: onboarding, fields, profile, market prices and a voice assistant. The owner did not like it.
- **Current version.** The owner asked for the **design and features of the website's demo phone** (`components/phone-app/`, `data/demo-scenarios.ts`, `data/farm-calendar.ts`). That is what the app is now: the same palette, fonts, icons, screens and scripted content.

**Components:** use ready-made free React components, not hand-made UI elements.

## Decisions

**Stack**
- **Expo SDK 57 with Expo Router.** The owner's Expo Go from the Play Store (57.0.9) supports SDK 57 only.
- **Components.** React Native Reusables (shadcn/ui for React Native, Uniwind variant), restyled with the demo's tokens. The used ones are Dialog, Checkbox, Progress and Text.
- **Icons.** Phosphor (`phosphor-react-native`), imported one file at a time to keep the bundle small, the same set the website uses.

**Look**
- The `.demo-app` palette: white, green `#15803d` and deep green `#14532d`, gold `#a16207`, borders `#bbf7d0`.
- DM Sans for text, Space Grotesk for headings.
- Rounded 18–26 px cards, soft green shadows.

**Navigation**
- Five tabs as in the demo: Ana sayfa, Taramalar (opens the camera), Hava, Takvim, Geçmiş.
- The camera, result and chat are stack screens above the tabs.

**Content**
- **Scenarios.** The demo's four scenarios, copied as they are; the text still needs an agronomist's review.
- **Calendar.** The demo's tasks, shifted so that the demo's "today" (14 October) is the real today.
- **Weather and prices.** The demo's 5-day forecast and prices.

**Simulated parts**
- **Scan result.** A photo maps to a scenario by a stable hash. Without camera permission, the shutter uses the chosen sample.
- **"Coming soon".** "Tarlalarım", "Tarla Haritası" and "Tümünü gör" open a "yakında" dialog.

## Verification at hand-over

- **Tests:** 23 Jest tests pass. Typecheck, Expo lint and Expo Doctor (21/21) are clean.
- **Web:** 14 end-to-end checks pass at phone size, with no console errors.
- **Native:** the Android and iOS Hermes bundles build. They have not been run on a device by us.
