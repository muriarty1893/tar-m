import { CATEGORIES, EMPTY_DRAFT, STOCK_PHOTOS, fold, formatPrice, hasCondition, listingImage, parsePrice, placeLabel, priceInput, priceLabel, soldByUnit, validateDraft, type ListingDraft } from '../market';

const good: ListingDraft = { ...EMPTY_DRAFT, title: 'Hasat römorku 3 ton', category: 'arac', condition: 'ikinci-el', price: '68.000', province: 'Konya', district: 'Çumra' };

describe('the listing form (the website’s checks)', () => {
  test('a complete draft passes; an empty one names every required field', () => {
    expect(validateDraft(good)).toEqual({});
    expect(Object.keys(validateDraft(EMPTY_DRAFT)).sort()).toEqual(['category', 'price', 'province', 'title']);
  });

  test('tools, equipment and vehicles need their condition; produce has none', () => {
    expect(validateDraft({ ...good, condition: '' }).condition).toBeDefined();
    expect(hasCondition('urun')).toBe(false);
    expect(validateDraft({ ...good, category: 'urun', condition: '', unit: 'ton' })).toEqual({});
  });

  test('produce and seed are priced by a unit from the list', () => {
    expect(soldByUnit('urun') && soldByUnit('tohum')).toBe(true);
    expect(validateDraft({ ...good, category: 'urun', unit: '' }).unit).toBeDefined();
    expect(validateDraft({ ...good, category: 'tohum', unit: 'litre' }).unit).toBeDefined();
  });

  test('the province must be one of the 81, the title 5 to 70 characters, the description at most 1000', () => {
    expect(validateDraft({ ...good, province: 'Mars' }).province).toBeDefined();
    expect(validateDraft({ ...good, title: 'Trak' }).title).toBeDefined();
    expect(validateDraft({ ...good, title: 'x'.repeat(71) }).title).toBeDefined();
    expect(validateDraft({ ...good, description: 'x'.repeat(1001) }).description).toBeDefined();
    expect(validateDraft({ ...good, photos: ['a', 'b', 'c', 'd', 'e', 'f'] }).photos).toBeDefined();
  });

  test('price accepts Turkish formatting and refuses text, zero and absurd sums', () => {
    expect(validateDraft({ ...good, price: '4,5' })).toEqual({});
    expect(validateDraft({ ...good, price: 'ucuz' }).price).toBeDefined();
    expect(validateDraft({ ...good, price: '0' }).price).toBeDefined();
    expect(validateDraft({ ...good, price: '200.000.000' }).price).toBeDefined();
  });
});

describe('prices and places', () => {
  test('parsePrice reads Turkish numbers', () => {
    expect(parsePrice('145.000')).toBe(145000);
    expect(parsePrice('1.250,75')).toBe(1250.75);
    expect(parsePrice('4,5')).toBe(4.5);
    expect(parsePrice('520000 ₺')).toBe(520000);
    expect(parsePrice('')).toBeNaN();
  });

  test('formatPrice and the form round-trip', () => {
    expect(formatPrice(520000)).toBe('520.000 ₺');
    expect(formatPrice(4.5)).toBe('4,50 ₺');
    expect(priceLabel({ price: 11200, unit: 'ton' })).toBe('11.200 ₺ / ton');
    expect(priceLabel({ price: 11200, unit: null })).toBe('11.200 ₺');
    expect(parsePrice(priceInput(685000))).toBe(685000);
    expect(parsePrice(priceInput(4.5))).toBe(4.5);
  });

  test('places and search folding', () => {
    expect(placeLabel('Konya', 'Çumra')).toBe('Çumra, Konya');
    expect(placeLabel('Konya', '')).toBe('Konya');
    expect(fold('TRAKTÖR İçin Işık')).toBe('traktor icin isik');
  });

  test('a listing without a photo shows its category’s bundled one', () => {
    expect(listingImage({ photo: 'https://x/y.webp', stockPhoto: true, category: 'arac' })).toBe(STOCK_PHOTOS.arac);
    expect(listingImage({ photo: 'https://x/y.webp', stockPhoto: false, category: 'arac' })).toEqual({ uri: 'https://x/y.webp' });
    for (const c of CATEGORIES) if (c.id !== 'tumu') expect(STOCK_PHOTOS[c.id]).toBeDefined();
  });
});
