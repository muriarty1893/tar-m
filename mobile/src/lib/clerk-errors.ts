/**
 * Clerk's errors in plain Turkish (the website shows Clerk's own Turkish texts; the app has its own
 * forms). Unknown codes get a general message rather than Clerk's English one.
 */
type ClerkLikeError = { errors?: { code?: string; longMessage?: string; message?: string }[]; code?: string; message?: string; status?: number };

const MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'Bu e-posta ile bir hesap bulunamadı. Adresi kontrol edin ya da yeni hesap açın.',
  form_password_incorrect: 'Şifre yanlış. Yeniden deneyin ya da “E-postama kod gönder”i kullanın.',
  form_password_pwned: 'Bu şifre daha önce bir veri sızıntısında görülmüş. Güvenliğiniz için başka bir şifre seçin.',
  form_password_not_strong_enough: 'Şifre yeterince güçlü değil. Daha uzun ya da tahmin edilmesi zor bir şifre seçin.',
  form_password_validation_failed: 'Şifre kabul edilmedi. Daha uzun ya da tahmin edilmesi zor bir şifre seçin.',
  form_identifier_exists: 'Bu e-posta ile zaten bir hesap var. Giriş yapın.',
  form_code_incorrect: 'Kod yanlış. E-postadaki 6 haneli kodu yeniden yazın.',
  verification_expired: 'Kodun süresi doldu. Yeni kod isteyin.',
  verification_failed: 'Doğrulama tamamlanamadı. Yeni kod isteyin.',
  too_many_requests: 'Çok fazla deneme yaptınız. Birkaç dakika bekleyip yeniden deneyin.',
  user_locked: 'Çok fazla hatalı deneme nedeniyle hesabınız geçici olarak kilitlendi. Biraz sonra yeniden deneyin.',
  form_param_format_invalid: 'Geçerli bir e-posta adresi yazın (ör. ad@ornek.com).',
  form_param_nil: 'Bu alanı doldurun.',
  form_param_missing: 'Bu alanı doldurun.',
  session_exists: 'Zaten giriş yaptınız.',
  identifier_already_signed_in: 'Zaten giriş yaptınız.',
  strategy_for_user_invalid: 'Bu hesap şifreyle değil Google ile açılmış. “Google ile devam et”i ya da e-posta kodunu kullanın.',
  network_error: 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.',
  // Clerk's bot check ("Protect"): the app can't show it, the website can.
  protect_check_required: 'Ek bir güvenlik kontrolü istendi; uygulama bunu gösteremiyor. Google ile devam edin ya da hesabı sitede açın.',
  protect_check_execution_failed: 'Güvenlik kontrolü tamamlanamadı. Yeniden deneyin ya da Google ile devam edin.',
  protect_check_unsupported_environment: 'Ek bir güvenlik kontrolü istendi; uygulama bunu gösteremiyor. Google ile devam edin ya da hesabı sitede açın.',
  captcha_invalid: 'Güvenlik kontrolü geçilemedi. Yeniden deneyin ya da Google ile devam edin.',
  captcha_unavailable: 'Güvenlik kontrolü yüklenemedi. Google ile devam edin ya da hesabı sitede açın.',
  captcha_missing_token: 'Güvenlik kontrolü yüklenemedi. Google ile devam edin ya da hesabı sitede açın.',
  form_password_size_in_bytes_exceeded: 'Şifre çok uzun. Daha kısa bir şifre seçin.',
  form_param_value_invalid: 'Bilgilerden biri kabul edilmedi. Kontrol edip yeniden deneyin.',
  sign_up_restricted_waitlist: 'Şu an yeni hesap açılamıyor. Daha sonra yeniden deneyin.',
  not_allowed_access: 'Bu e-posta ile hesap açılamıyor. Başka bir adres deneyin.',
};

/** Clerk's codes for its bot check (the app has no screen for it). */
export const PROTECT_CODES = new Set(['protect_check_required', 'protect_check_unsupported_environment', 'protect_check_execution_failed', 'captcha_unavailable', 'captcha_missing_token', 'captcha_invalid']);

export function clerkCode(err: unknown): string {
  const e = (err ?? {}) as ClerkLikeError;
  return e.errors?.[0]?.code ?? e.code ?? '';
}

export function clerkMessage(err: unknown): string {
  const e = (err ?? {}) as ClerkLikeError;
  const first = e.errors?.[0];
  const code = first?.code ?? e.code ?? '';
  if (code === 'form_password_length_too_short') {
    const min = /(\d+)/.exec(first?.longMessage ?? first?.message ?? '')?.[1];
    return `Şifre çok kısa: en az ${min ?? 'gereken sayıda'} karakter olmalı.`;
  }
  if (MESSAGES[code]) return MESSAGES[code];
  if (/network|fetch|offline/i.test(e.message ?? '')) return MESSAGES.network_error;
  // The code helps when someone reports the problem ("kod: …").
  return `İşlem tamamlanamadı. Bilgileri kontrol edip yeniden deneyin.${code ? ` (kod: ${code})` : ''}`;
}

/** Which field an error is about, to show it under that field. */
export function clerkField(err: unknown): 'email' | 'password' | 'code' | null {
  const e = (err ?? {}) as ClerkLikeError & { errors?: { meta?: { paramName?: string } }[] };
  const param = (e.errors?.[0] as { meta?: { paramName?: string } } | undefined)?.meta?.paramName ?? '';
  const code = e.errors?.[0]?.code ?? '';
  if (param.includes('password') || code.startsWith('form_password')) return 'password';
  if (param === 'code' || code === 'form_code_incorrect' || code.startsWith('verification')) return 'code';
  if (param.includes('identifier') || param.includes('email') || code.startsWith('form_identifier')) return 'email';
  return null;
}
