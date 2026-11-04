import { router } from 'expo-router';

import { ApiError, errorMessage } from '@/api/client';

/**
 * After a failed call: sends the person where they can fix it (sign-in, or Hesabım for the name other
 * people see) and returns true; otherwise returns false and the screen shows `errorMessage(err)`.
 */
export function redirectForError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.code === 'sign_in') {
    router.push('/giris');
    return true;
  }
  if (err.code === 'name_required') {
    router.push({ pathname: '/hesap', params: { ad: '1' } });
    return true;
  }
  return false;
}

export { errorMessage };
