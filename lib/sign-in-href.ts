/** The sign-in page, coming back to `returnTo` afterwards. */
export const signInHref = (returnTo: string) => `/giris?redirect_url=${encodeURIComponent(returnTo)}`;
