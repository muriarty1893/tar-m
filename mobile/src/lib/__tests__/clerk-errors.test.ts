import { clerkField, clerkMessage } from '../clerk-errors';

const err = (code: string, extra: object = {}) => ({ errors: [{ code, ...extra }] });

describe('Clerk errors in Turkish', () => {
  test('known codes, under the right field', () => {
    expect(clerkMessage(err('form_password_incorrect'))).toMatch(/Şifre yanlış/);
    expect(clerkField(err('form_password_incorrect'))).toBe('password');
    expect(clerkField(err('form_identifier_not_found'))).toBe('email');
    expect(clerkField(err('form_code_incorrect'))).toBe('code');
  });

  test('the minimum length comes from Clerk’s message', () => {
    expect(clerkMessage(err('form_password_length_too_short', { longMessage: 'Passwords must be 15 characters or more.' }))).toBe('Şifre çok kısa: en az 15 karakter olmalı.');
  });

  test('anything else: a general Turkish message, never English', () => {
    expect(clerkMessage(err('something_new'))).toMatch(/İşlem tamamlanamadı/);
    expect(clerkMessage(new Error('Network request failed'))).toMatch(/İnternet/);
    expect(clerkField(err('something_new'))).toBeNull();
  });
});
