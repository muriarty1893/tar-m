# The hero's phone picture

The desktop home page's hero shows the site on a phone: `public/hero/phone.webp` (760×1512, transparent).

- **The phone** was rendered from the 3D model “iPhone 17 Pro” by Ranguel,
  https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec, licensed CC BY 4.0. The credit is
  on /kaynaklar (`modelCredit` in `data/photo-credits.ts`); keep it there while the picture is used. The 3D demo that
  used the model live was removed in November 2026, and with it the model file.
- **The screen** is the site's own mobile home page (393×772 at 3×, under an iPhone status bar), warped onto the
  phone's screen with ImageMagick. The forum rows and the Pazar tile show sample content, as the old demo did.

## Refreshing the screen

1. Run the site (`npm run dev`) and take a 3× screenshot of `/` at 393×772 with Playwright (`deviceScaleFactor: 3`,
   `isMobile: true`), the welcome question answered (`localStorage["bereket-hosgeldin"]`) and the Next.js dev badge
   hidden (`nextjs-portal { display: none }`).
2. Put it under a 54 px status bar (09:41, signal, Wi-Fi, battery, the Dynamic Island) on a 393×852 card with 55 px
   rounded corners and a home indicator, and screenshot that with a transparent background (1179×2556).
3. Warp it onto the screen. The screen's corners in the 760×1512 picture are where its straight edges meet:

   ```bash
   magick public/hero/phone.webp \( screen.png -alpha set -virtual-pixel transparent \
     -define distort:viewport=760x1512+0+0 \
     -distort Perspective "0,0 36.3,114.5  1179,0 631.9,26.3  1179,2556 699.4,1437.6  0,2556 62.5,1466.3" \) \
     -composite -define webp:alpha-quality=100 -quality 86 public/hero/phone.webp
   ```
