import { hasErrors, mergeErrors } from '../form-errors';

describe('form errors', () => {
  test('a cleared server message is not an error (the silent-button bug)', () => {
    const errors = mergeErrors({}, { title: undefined, price: undefined });
    expect(hasErrors(errors)).toBe(false);
    expect(Object.keys(errors)).toEqual([]);
  });

  test('server messages add to the form’s own; real messages count', () => {
    expect(mergeErrors({ title: 'Kısa' }, { slug: 'Kullanılıyor', price: undefined })).toEqual({ title: 'Kısa', slug: 'Kullanılıyor' });
    expect(hasErrors({ title: 'Kısa' })).toBe(true);
    expect(hasErrors({ title: '' })).toBe(false);
  });
});
