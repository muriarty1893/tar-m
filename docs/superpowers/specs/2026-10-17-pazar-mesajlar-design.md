# Pazar (marketplace) and Mesajlar (messages): design

Mobile app (`mobile/`), clickable prototype on sample data, like the rest of the app.

## Decisions (from the user)

- **Farmer marketplace**: anyone posts a listing (harvest, seed and fertiliser, hand tools, equipment, vehicles) with photos and a price; buyers message the seller. No in-app payment.
- **Listing chats**: every conversation belongs to a listing. One inbox.
- **Navigation**: tabs become Ana sayfa · Taramalar · Pazar · Takvim · Geçmiş. Weather moves off the tab bar: the home weather card opens it. A messages button with an unread badge sits on the home card and in Pazar.

## Design pass (ui-ux-pro-max)

The skill's "Marketplace / Directory" pattern is followed: search is the primary action, categories are visible (not behind a filter sheet), listings follow, trust and safety cues are present, and "İlan ver" (list your item) is always one tap away. Its suggested blue palette and Inter/Playfair fonts are **not** used: the app keeps its established look (white, green `#15803d`, gold, DM Sans + Space Grotesk, 18–26 px radii, Phosphor duotone icons).

Rules applied from its UX and React Native guidance:
- Category chips wrap onto a second line rather than being clipped.
- Every form field has a visible label (not a placeholder only). Validation runs on blur and on submit, with errors under the field plus a summary at the top after a failed submit.
- The price field uses a numeric keyboard. The chat and form use KeyboardAvoidingView.
- Empty and no-result states always offer an action: clear filters, post a listing, browse the market.
- Unread badges have a full spoken label ("Mesajlar, 2 okunmamış sohbet"), not a bare number.
- Touch targets are at least 44 pt, all tappables have a pressed state, and icon buttons are labelled.
- Long lists use FlatList; images use expo-image as webp.

## Screens

- **Pazar** (tab):
  - Title row with a messages button.
  - Search field with a clear button.
  - Keşfet / Favoriler / İlanlarım switch.
  - Category chips: Tümü, Ürün, Tohum & Gübre, Alet, Ekipman, Araç.
  - Safety strip.
  - Result count and a two-column grid. Each card has a photo, a heart, price, title, and place · time.
  - Floating "İlan ver" button.
- **İlan** (`/ilan/[id]`):
  - Photo header with back, favourite and share buttons.
  - Category and condition badges, title, and price with unit and a "Pazarlık payı var" note.
  - Three fact tiles: where, when, quantity or model year.
  - "Özellikler" (specs), "Açıklama" (description).
  - Seller card: initials, rating, reply time, member since, verified phone.
  - Safety tips.
  - Sticky bar with "Teklif ver" and "Mesaj gönder". On your own listing, it shows "Satıldı olarak işaretle" and "Kaldır" (with confirmation) instead.
- **İlan ver** (`/ilan/yeni`, modal):
  - Photos: up to 5, from the gallery or camera. Without one, the category's stock photo is used.
  - Fields: title, category, condition (not for produce), price (TL) with unit and quantity (produce/seed only), location, description (500 characters), and a "Pazarlık payı var" switch.
  - Sticky "İlanı yayınla". It shows a short busy state, then opens the new listing with an "İlanınız yayında" banner.
- **Mesajlar** (`/mesajlar`):
  - Tümü / Alıyorum / Satıyorum switch.
  - Rows show listing thumbnail, name, time, listing title, last line ("Siz:" prefix, offers as "Teklif: ₺…"), and an unread count.
- **Sohbet** (`/mesajlar/[id]`):
  - Header with person and reply time.
  - Pinned listing card.
  - Day separators. Bubbles with time and a read tick on your own messages.
  - Offer cards: amount and status (bekliyor / kabul edildi / reddedildi / karşı teklif) with "Kabul et" on a counter-offer.
  - Typing indicator and quick replies.
  - Input row with an offer button (buyer side) and a send button.

## Scripted behaviour (no server)

- **Replies:** the other person answers about 1.2 s after each message. A buyer's questions get answers from the seller, keyed on words such as price, location, availability and delivery. On your own listings, the buyer replies the same way.
- **Offers:**
  - At or above 92 % of the asking price, the offer is accepted.
  - Below 60 %, it's turned down politely.
  - Otherwise the seller counters halfway between the offer and the price, rounded to a sensible step.
  - Accepting a counter-offer marks it accepted, and the seller suggests where to meet.
- **Unread:** the inbox opens with sample chats, two of them unread. One is a buyer asking about Ayşe's own listing.
- **Persistence:** everything (new listings, favourites, chats, sold/removed) is saved on the device with the existing store.
