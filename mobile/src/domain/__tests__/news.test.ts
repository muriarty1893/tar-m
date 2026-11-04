import { MARKDOWN_TOOLS, applyTool, slugify, validateArticle } from '../news';

const tool = (id: string) => MARKDOWN_TOOLS.find((t) => t.id === id)!;
const good = { title: 'Buğday hasadı başladı', slug: 'bugday-hasadi-basladi', summary: 'Konya’da hasat erken başladı.', body: 'Metin.', cover: '', date: '2026-11-04', status: 'published' as const };

describe('news editor (the website’s rules)', () => {
  test('addresses from titles, Turkish letters folded', () => {
    expect(slugify('Buğday hasadı başladı!')).toBe('bugday-hasadi-basladi');
    expect(slugify("Konya'da don uyarısı")).toBe('konyada-don-uyarisi');
  });

  test('a published article needs its text; drafts may be empty', () => {
    expect(validateArticle(good)).toEqual({});
    expect(validateArticle({ ...good, body: ' ' }).body).toBeDefined();
    expect(validateArticle({ ...good, body: '', status: 'draft' })).toEqual({});
    expect(validateArticle({ ...good, slug: 'Kötü Adres' }).slug).toBeDefined();
    expect(validateArticle({ ...good, date: '2026-02-30' }).date).toBeDefined();
  });

  test('the toolbar wraps the selection, or puts in a sample', () => {
    expect(applyTool('çok önemli', { start: 4, end: 10 }, tool('bold'))).toEqual({ text: 'çok **önemli**', selection: { start: 6, end: 12 } });
    expect(applyTool('', { start: 0, end: 0 }, tool('h2'))).toEqual({ text: '## Ara başlık', selection: { start: 3, end: 13 } });
    // Line formats turn the cursor's line into a heading or list item, wherever the cursor is on it.
    expect(applyTool('Giriş paragrafı.', { start: 0, end: 0 }, tool('h2')).text).toBe('## Giriş paragrafı.');
    expect(applyTool('Bir\nİki', { start: 6, end: 6 }, tool('ul'))).toEqual({ text: 'Bir\n- İki', selection: { start: 8, end: 8 } });
    expect(applyTool('Bir\n\n', { start: 4, end: 4 }, tool('quote')).text).toBe('Bir\n> Alıntı\n');
    expect(applyTool('site', { start: 0, end: 4 }, tool('link')).text).toBe('[site](https://)');
  });
});
