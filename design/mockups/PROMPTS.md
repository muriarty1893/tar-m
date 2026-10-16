# Çiftçi Destek: mockup prompts

Paste ONE block per message into ChatGPT (chatgpt.com, image generation), attach `public/brand/logo.webp` to the first message, and save each image here under its file name.

First message only, before the first screen: "I'll ask you for several mobile app screen images for one app. Keep every image in exactly this design system." followed by the Design bible section below.

## The app
"Çiftçi Destek" (tagline "Çiftçinin Akıllı Rehberi"): an AI farming assistant app for farmers in Turkey. Its core feature is a plant-disease scan: photograph a leaf, get a diagnosis and clear treatment steps. Users are farmers of all ages, often outdoors in bright sun, many not tech-savvy, so text must be large, high contrast and in plain Turkish. ALL text in the screens is Turkish; use exactly the Turkish strings given below (keep Turkish letters ç ğ ı İ ö ş ü correct).


## Design bible (lock it; every screen must follow it so all images look like one product)
- Platform: cross-platform premium neutral (works on iOS and Android), clean safe areas, status bar at top, home indicator at bottom.
- Device: the same clean, subtle modern phone mockup (thin dark frame, rounded corners) in every image, same scale, centred, with even margins on a plain warm-sand (#E9E1D3) canvas and a soft shadow. The screen content is the hero, not the device.
- Theme: warm neutral palette with sharp dark contrast. Cream paper background (#F4EEE3) with a subtle matte paper grain; sand surfaces (#E9DFCD) for grouping; deep soil brown (#2B2118) for text, dark buttons and the tab bar; ONE terracotta/clay accent (#B9482A) reserved only for the scan action; muted olive (#5B6B2F) meaning healthy/good; amber (#D98E1E) and brick red (#B3261E) only for risk and disease severity. No neon, no purple/blue gradients, no glassmorphism, no generic bright green.
- Typography: expressive premium display grotesque for headings (warm, bold, tight, like Bricolage Grotesque) with a very legible humanist sans for body (like Atkinson Hyperlegible). Big confident numbers for temperature, confidence and prices. Body text never small.
- Layout: generous spacing, calm, one primary action per screen, few containers, soft rounded cards (about 24px radius) separated by surface colour instead of borders; no box-in-box clutter, no pill/badge spam, no fake charts.
- Imagery: real editorial photography: macro wheat/tomato leaves, golden wheat fields of Central Anatolia, ploughed soil, morning light. Photos sit in stable rounded frames or as image-backed headers that fade softly into the cream background so text stays readable.
- Icons: a consistent custom-feeling rounded line icon set with slightly organic, agricultural character (sprout, field, leaf scan, calendar, sun/cloud), same stroke weight everywhere. Not generic library icons.
- Decorative accents (only these two): fine dotted arc lines, and small amber ring markers (used to mark infected spots on leaves).
- Navigation: a floating dark soil-brown rounded tab bar at the bottom with 5 tabs: "Bugün", "Tarlalar", "Tara" (centre, a raised terracotta circle with a leaf-scan icon), "Takvim", "Profil". The active tab is clearly highlighted. Show it on the main tab screens (3, 6, 7, 8 and 9).
- Signature components: large hero metric card, compact stat strip, photo-led card strip, bottom action sheet.


## 01-hos-geldin.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Welcome): a full-bleed golden Anatolian wheat field photo filling the top two-thirds, fading softly into cream. The logo badge, then the title "Çiftçi Destek" and the subtitle "Çiftçinin Akıllı Rehberi". One short line: "Yaprağın fotoğrafını çek, hastalığı hemen öğren." A big dark pill button "Başlayalım", and below it a text link "Zaten hesabım var". Very clean, a single focal point.
```

## 02-urunlerini-sec.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Onboarding step 2 of 3): a progress indicator "2 / 3", the title "Neler yetiştiriyorsun?" and a grid of 6 large photo tiles with labels: "Buğday", "Domates", "Mısır", "Ayçiçeği", "Zeytin", "Arpa". "Buğday" and "Domates" are selected (an olive check mark and an olive outline). A dark button at the bottom: "Devam et".
```

## 03-bugun.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Home, "Bugün" tab active): the greeting "Günaydın, Ahmet" and the location "Ereğli, Konya". A large hero weather card: "19°", "Güneşli", and the verdict in one plain sentence with an olive check: "Bugün ilaçlama için uygun". A compact stat strip: "Rüzgâr 8 km/s", "Nem %42", "Yağmur yok". A big terracotta card: "Yaprağı tara" with "Hastalığı 10 saniyede öğren". An amber warning card: "Bölgende sarı pas yayılıyor" / "12 km içinde 8 bildirim". The section "Bugünkü işler" with 2 tasks and round checkboxes: "Damla sulamayı kontrol et · Domates bahçesi" and "Taban gübresi (DAP) at · Buğday tarlası".
```

## 04-tara.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Camera): a full-screen live camera view of a wheat leaf covered in yellow-orange rust stripes, a rounded guide frame with soft corner brackets, the hint "Yaprağı çerçeveye al", crop chips at the bottom ("Buğday" selected in terracotta, then "Domates", "Mısır", "Ayçiçeği"), a gallery button on the left, a big terracotta shutter button in the centre, and a help button on the right. A close (X) button and a flash icon at the top. No tab bar.
```

## 05-teshis-sonucu.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Diagnosis result): the leaf photo at the top with 3 amber ring markers on the rust spots; a bottom action sheet rising over the photo with: the label "Teşhis", the title "Sarı pas", the Latin name "Puccinia striiformis" in italics, a very large "%87" with "güven". A compact stat strip: "Şiddet: Orta" (amber dot) and "Yayılma: Hızlı · 3–5 gün". The section "Ne yapmalısın?" with 3 numbered steps: "1 Tarlayı bu hafta gözden geçir", "2 Kimyasal: triazol grubu fungisit", "3 Organik: kükürt bazlı preparat". A small olive card: "İlaçlama için en iyi zaman: Yarın 06:00–09:00". Buttons: a dark pill "Takvime ekle", and two outline pills "Uzmana sor" and "Yeniden tara".
```

## 06-tarla-detayi.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Field detail, "Tarlalar" tab active): an image-backed header of a wheat field fading into cream, with a back button; the title "Kuzey Tarlası", the subtitle "Buğday · 24 dönüm"; a large hero metric "Sağlık %92" with an olive progress ring; a compact stat strip "Ekim 12 Ekim", "Son tarama 2 gün önce", "Hasada 41 gün"; the section "Tarama geçmişi" as a vertical timeline with small leaf photo thumbnails: "14 Eki · Sarı pas · Orta" (amber), "02 Eki · Sağlıklı" (olive), "21 Eyl · Sağlıklı" (olive).
```

## 07-takvim.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Calendar, "Takvim" tab active): the title "Takvim", a clean month view "Ekim 2026" with today (16) marked in terracotta and small coloured dots on days with tasks, then the section "16 Ekim, Cuma" with task rows, each with a small custom icon and a field name: "İlaçlama · Kuzey Tarlası · 06:00", "Sulama · Domates bahçesi · 17:30", "Gübre siparişi · Bayi". A small round "+" add button.
```

## 08-hal-fiyatlari.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Market prices; reached from Bugün, "Bugün" tab active): the title "Hal fiyatları", the subtitle "Bugün · Konya Hali", a premium segmented control "Ürünlerim | Tümü" (Ürünlerim selected). A list of large rows, each with a photo thumbnail, a name, a big price and a small trend: "Buğday · 11,40 ₺/kg · ▲ %2,1" (olive), "Domates · 18,75 ₺/kg · ▼ %4,3" (brick red), "Mısır · 9,85 ₺/kg · ▲ %0,8" (olive), "Ayçiçeği · 24,10 ₺/kg · – %0,0". At the bottom: "Son güncelleme 09:30".
```

## 09-sesli-asistan.png

```text
Generate one mobile app screen image (portrait, one phone mockup, same design system as before). All text in Turkish, exactly as written. (Voice assistant): a calm screen; the title "Sesli asistan"; a chat with large message bubbles. The farmer (right, sand bubble): "Domateslerin yaprakları sararıyor, ne yapayım?". The assistant (left, cream with a small logo avatar): "Alt yapraklardan başlıyorsa azot eksikliği olabilir. Bir yaprağın fotoğrafını çekersen kesin söyleyebilirim." with a small terracotta button "Yaprağı tara". At the bottom, a large round terracotta microphone button with a soft waveform line, and the text "Konuşmak için basılı tut".
```
