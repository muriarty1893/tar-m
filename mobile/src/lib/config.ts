/**
 * Where the app's data lives: the website (its API under /api/app) and its Clerk sign-in.
 * Both values are public by design. Override them with EXPO_PUBLIC_API_URL and
 * EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (in mobile/.env.local) to try the app against a local site.
 */
export const SITE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://www.ciftcidestek.com.tr').replace(/\/$/, '');

/**
 * The Clerk instance the website signs in with: production, on ciftcidestek.com.tr. A local site runs
 * on the development instance, so pair EXPO_PUBLIC_API_URL with its pk_test_… key.
 */
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_live_Y2xlcmsuY2lmdGNpZGVzdGVrLmNvbS50ciQ';

/** Who sends the sign-up and sign-in codes: production mails from the site's domain, development from Clerk's. */
export const CODE_SENDER = CLERK_PUBLISHABLE_KEY.startsWith('pk_live_') ? 'notifications@ciftcidestek.com.tr' : 'notifications@accounts.dev';

/** A path on the website as a full address ("/demo/x.webp" → "https://…/demo/x.webp"). */
export const siteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
