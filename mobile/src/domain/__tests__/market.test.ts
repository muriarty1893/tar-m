import { CATEGORIES, LISTINGS, ME, STOCK_PHOTOS, filterListings, fold, listingById, listingFromDraft, priceLabel, sellerById, validateDraft, type Listing, type ListingDraft } from '../market';

const listing = (over: Partial<Listing>): Listing => ({ ...LISTINGS[0], ...over });

describe('market data', () => {
  test('every listing has a known category and seller, a price and a photo', () => {
    const cats = CATEGORIES.map((c) => c.id);
    for (const l of LISTINGS) {
      expect(cats).toContain(l.category);
      expect(sellerById(l.sellerId)).toBeDefined();
      expect(l.price).toBeGreaterThan(0);
      expect(l.photos.length).toBeGreaterThan(0);
    }
  });

  test('covers produce, seed, tools, equipment and vehicles, and one listing of my own', () => {
    for (const c of ['urun', 'tohum', 'alet', 'ekipman', 'arac'] as const) expect(LISTINGS.some((l) => l.category === c)).toBe(true);
    expect(LISTINGS.filter((l) => l.sellerId === ME.id)).toHaveLength(1);
  });

  test('listingById', () => {
    expect(listingById(LISTINGS[0].id, [])).toBe(LISTINGS[0]);
    const mine = listing({ id: 'u-1' });
    expect(listingById('u-1', [mine])).toBe(mine);
    expect(listingById('nope', [])).toBeUndefined();
  });
});

describe('fold (search matching)', () => {
  test('ignores case and Turkish letters, so "traktor" finds "Traktör"', () => {
    expect(fold('Traktör')).toBe('traktor');
    expect(fold('İLAÇLAMA ışık')).toBe('ilaclama isik');
    expect(fold('Çapa, Gübre, Şeker')).toBe('capa, gubre, seker');
  });
});

describe('filterListings', () => {
  const a = listing({ id: 'a', title: 'Massey Ferguson traktör', category: 'arac', sellerId: 's-1', description: '', location: 'Ereğli, Konya' });
  const b = listing({ id: 'b', title: 'Ekmeklik buğday', category: 'urun', sellerId: 's-2', description: 'Çumra hasadı' });
  const mine = listing({ id: 'c', title: 'Sırt pompası', category: 'ekipman', sellerId: ME.id, description: '' });
  const all = [a, b, mine];
  const base = { query: '', category: 'tumu' as const, view: 'kesfet' as const, favorites: [], status: {} };

  test('Keşfet shows everyone else\'s listings', () => {
    expect(filterListings(all, base).map((l) => l.id)).toEqual(['a', 'b']);
  });

  test('search looks at title, description and place, ignoring case and accents', () => {
    expect(filterListings(all, { ...base, query: 'TRAKTOR' }).map((l) => l.id)).toEqual(['a']);
    expect(filterListings(all, { ...base, query: 'cumra' }).map((l) => l.id)).toEqual(['b']);
  });

  test('search also matches the category and the specs, so "traktör" and "araç" find the tractor', () => {
    const live = { ...base, view: 'kesfet' as const };
    expect(filterListings(LISTINGS, { ...live, query: 'traktör' }).map((l) => l.id)).toContain('l-traktor');
    expect(filterListings(LISTINGS, { ...live, query: 'araç' }).map((l) => l.id)).toEqual(expect.arrayContaining(['l-traktor', 'l-romork', 'l-bicerdover']));
    expect(filterListings(LISTINGS, { ...live, query: 'bezostaja' }).map((l) => l.id)).toEqual(['l-bugday']);
  });

  test('category narrows the list', () => {
    expect(filterListings(all, { ...base, category: 'urun' }).map((l) => l.id)).toEqual(['b']);
  });

  test('Favoriler shows only favourites; İlanlarım only mine, sold ones included', () => {
    expect(filterListings(all, { ...base, view: 'favoriler', favorites: ['b'] }).map((l) => l.id)).toEqual(['b']);
    expect(filterListings(all, { ...base, view: 'ilanlarim', status: { c: 'sold' } }).map((l) => l.id)).toEqual(['c']);
  });

  test('sold listings leave Keşfet, removed ones leave everywhere', () => {
    expect(filterListings(all, { ...base, status: { a: 'sold' } }).map((l) => l.id)).toEqual(['b']);
    expect(filterListings(all, { ...base, view: 'ilanlarim', status: { c: 'removed' } })).toEqual([]);
  });
});

describe('priceLabel', () => {
  test('whole liras with thousands dots, and the unit for produce', () => {
    expect(priceLabel(listing({ price: 520000, unit: undefined }))).toBe('520.000 ₺');
    expect(priceLabel(listing({ price: 11200, unit: 'ton' }))).toBe('11.200 ₺ / ton');
    expect(priceLabel(listing({ price: 4.5, unit: 'metre' }))).toBe('4,50 ₺ / metre');
  });
});

describe('validateDraft', () => {
  const good: ListingDraft = { title: 'Az kullanılmış römork', category: 'ekipman', condition: 'ikinci-el', price: '145000', unit: '', quantity: '', location: 'Merkez, Konya', description: '', negotiable: true, photos: [] };

  test('a complete draft has no errors', () => {
    expect(validateDraft(good)).toEqual({});
  });

  test('title, category, price and place are required, with messages for each', () => {
    const errors = validateDraft({ ...good, title: 'Rö', category: null, price: '0', location: ' ' });
    expect(errors.title).toMatch(/en az 5/);
    expect(errors.category).toBeDefined();
    expect(errors.price).toBeDefined();
    expect(errors.location).toBeDefined();
  });

  test('price accepts Turkish formatting ("145.000", "4,5") and rejects text', () => {
    expect(validateDraft({ ...good, price: '145.000' })).toEqual({});
    expect(validateDraft({ ...good, price: '4,5' })).toEqual({});
    expect(validateDraft({ ...good, price: 'ucuz' }).price).toBeDefined();
  });

  test('produce needs a unit; the description is at most 500 characters', () => {
    expect(validateDraft({ ...good, category: 'urun', unit: '' }).unit).toBeDefined();
    expect(validateDraft({ ...good, category: 'urun', unit: 'ton' })).toEqual({});
    expect(validateDraft({ ...good, description: 'x'.repeat(501) }).description).toBeDefined();
  });
});

describe('listingFromDraft', () => {
  const draft: ListingDraft = { title: 'Hasat römorku 3 ton', category: 'arac', condition: 'ikinci-el', price: '68.000', unit: 'ton', quantity: '5', location: ' Merkez, Konya ', description: '', negotiable: true, photos: [] };

  test('without photos it uses the category stock photo and says so', () => {
    const l = listingFromDraft(draft, 'u-1', new Date(2026, 9, 17));
    expect(l).toMatchObject({ id: 'u-1', price: 68000, location: 'Merkez, Konya', sellerId: ME.id, stockPhoto: true, unit: undefined, quantity: undefined });
    expect(l.photos).toEqual([STOCK_PHOTOS.arac]);
  });

  test('produce keeps its unit and quantity; own photos are not stock', () => {
    const l = listingFromDraft({ ...draft, category: 'urun', photos: ['file:///a.jpg'] }, 'u-2', new Date());
    expect(l).toMatchObject({ unit: 'ton', quantity: '5 ton', stockPhoto: false, condition: undefined, photos: ['file:///a.jpg'] });
  });
});
