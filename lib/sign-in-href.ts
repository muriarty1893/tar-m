/** The sign-in page, coming back to `returnTo` afterwards. */
export const signInHref = (returnTo: string) => `/giris?redirect_url=${encodeURIComponent(returnTo)}`;

/**
 * A path on this site to return to, from the address bar (`redirect_url`, `devam`); anything else is
 * `fallback`. "//evil.com" and "/\evil.com" (browsers read a backslash as a slash) lead to other sites,
 * and control characters can hide either, so all of those are refused.
 */
export function safeReturnPath(asked: unknown, fallback = "/"): string {
  if (typeof asked !== "string" || !asked.startsWith("/")) return fallback;
  if (asked[1] === "/" || asked[1] === "\\" || /[\u0000-\u001f\u007f\\]/.test(asked)) return fallback;
  return asked;
}
