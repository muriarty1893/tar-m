import { getClerkInstance } from '@clerk/expo';

import { SITE_URL } from '@/lib/config';

/**
 * Calls the website's API for the app (/api/app/…), signed in with the Clerk session token when
 * there is one. Answers that aren't 2xx become an ApiError with the server's Turkish message.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** "sign_in", "name_required", "not_admin"… */
    readonly code?: string,
    /** A form's messages under each field (422). */
    readonly errors: Record<string, string> = {}
  ) {
    super(message);
  }
}

export const OFFLINE_MESSAGE = 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.';

async function authHeader(): Promise<Record<string, string>> {
  try {
    const token = await getClerkInstance().session?.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

type Options = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; raw?: { data: Blob; type: string } };

export async function api<T>(path: string, { method = 'GET', body, raw }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(await authHeader()) };
  let payload: BodyInit | undefined;
  if (raw) {
    headers['Content-Type'] = raw.type;
    payload = raw.data;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res: Response;
  try {
    res = await fetch(`${SITE_URL}/api/app${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, OFFLINE_MESSAGE, 'offline');
  }
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // An empty or non-JSON answer: the status says enough.
  }
  if (!res.ok) {
    const errors = (data.errors && typeof data.errors === 'object' ? data.errors : {}) as Record<string, string>;
    const message = String(data.message ?? data.error ?? (res.status === 422 ? 'Bazı alanları düzeltin.' : 'Bir sorun oluştu. Biraz sonra yeniden deneyin.'));
    throw new ApiError(res.status, message, typeof data.code === 'string' ? data.code : undefined, errors);
  }
  return data as T;
}

/** The message to show for any error a call threw. */
export const errorMessage = (err: unknown) => (err instanceof ApiError ? err.message : OFFLINE_MESSAGE);
