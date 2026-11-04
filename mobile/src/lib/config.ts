/**
 * Where the app's data lives: the website (its API under /api/app) and its Clerk sign-in.
 * Both values are public by design. Override them with EXPO_PUBLIC_API_URL and
 * EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (in mobile/.env.local) to try the app against a local site.
 */
export const SITE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://tar-m-flame.vercel.app').replace(/\/$/, '');

/** The Clerk instance the website signs in with (development keys until the site has its own domain). */
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_a25vd2luZy10YXJwb24tOTU2Mi5jbGVyay5hY2NvdW50cy5kZXYk';

/** A path on the website as a full address ("/demo/x.webp" → "https://…/demo/x.webp"). */
export const siteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
