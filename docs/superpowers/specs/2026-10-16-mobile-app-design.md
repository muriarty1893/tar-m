# Çiftçi Destek mobile app: design record

Date: 2026-10-16 · Status: first prototype built (`mobile/`)

## Agreed with the owner

**Platforms and scope**
- One app for Android and iOS.
- The first version is a **clickable prototype on sample data**: no real AI, sign-in, server or payments.

**Product**
- The core flow is the **disease scan**: camera → analysing → diagnosis with treatment steps.
- Keep the Çiftçi Destek **name and logo**. The rest of the look is free, and features may go beyond the website.

**Design and build**
- **Design.** The look was made with design skills. Sleek produced four screens: the free tier caps a project at four. An image-generation skill was tried and could not run here. The owner chose to build from the Sleek screens rather than wait for more mockups.
- **Components.** Use ready-made free React components, not hand-made UI elements.

## Decisions

**Stack**
- **Expo SDK 57 with Expo Router.** The owner's Expo Go from the Play Store (57.0.9) supports SDK 57 only; SDK 58 was out but not yet in that Expo Go.
- **Components.** React Native Reusables (shadcn/ui for React Native, Uniwind variant) is the ready-made library. HeroUI Native was the first choice but did not support SDK 58's gesture-handler 3.
- **Icons.** The Solar icons match the Sleek design. They come from the official `@iconify-json/solar` data.

**Look ("Toprak")**
- Cream paper background, soil-brown text and controls.
- Terracotta is reserved for scanning. Olive means healthy; amber and brick mean risk.
- Fonts: Bricolage Grotesque (headings) and Atkinson Hyperlegible Next (body).
- Large type and touch targets, for outdoor use.

**Navigation**
- Five tabs: Bugün, Tarlalar, a raised centre Tara button, Takvim and Profil.
- The scan flow and detail screens are stack screens above the tabs.

**Features added beyond the website**
- The spraying-window verdict.
- Regional outbreak warnings.
- Field health and scan history.
- Market prices.
- A Turkish voice assistant that reads its answers aloud.
- An "ask an agronomist" request.
- Sample photos for trying a scan without a diseased plant.

**Simulated parts**
- **Diagnosis** is `diagnose()`. It is deterministic per photo, and sample photos have fixed results.
- **Weather** is a deterministic 48-hour sample. Spraying needs no rain, wind ≤ 15 km/s, 8–28 °C, and 06:00–20:00.
- **Prices and alerts** are sample data.
- **Voice input** is simulated, because speech-to-text needs a native module that Expo Go lacks. Text-to-speech is real (`expo-speech`).

## Verification at hand-over

- **Tests:** 34 Jest tests pass. Typecheck, Expo lint and Expo Doctor (20/20) are clean.
- **Web:** 15 end-to-end flow checks pass at phone size, with no console errors.
- **Native:** the Android and iOS Hermes bundles build. They have not yet been run on a physical device or emulator.
