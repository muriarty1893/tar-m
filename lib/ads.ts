/**
 * Google AdSense, switched on by one setting: `NEXT_PUBLIC_ADSENSE_CLIENT` = the publisher id
 * ("ca-pub-1234567890123456", from AdSense → Account → Account information). Without it the site
 * shows no ads, no consent banner and no ads.txt. Ads load only after the visitor accepts (KVKK).
 */

const raw = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "").trim();

/** The publisher id as AdSense's tag wants it ("ca-pub-…"), or null when ads are off or it's malformed. */
export const ADSENSE_CLIENT: string | null = /^ca-pub-\d{10,20}$/.test(raw) ? raw : null;

/** The line Google looks for at /ads.txt ("google.com, pub-…, DIRECT, f08c47fec0942fa0"). */
export function adsTxt(client: string): string {
  return `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`;
}

/** Where the visitor's answer is kept in this browser. */
export const AD_CONSENT_KEY = "reklam-onayi";
/** Dispatched by the footer's "Reklam tercihleri" to ask again. */
export const AD_PREFS_EVENT = "reklam-tercihleri";

/** Pages that never load ads: sign-in, the account, messages, admin and design previews. */
export function adFreePath(path: string): boolean {
  return /^\/(yonetim|giris|kayit|hesabim|mesajlar|tasarimlar)(\/|$)/.test(path);
}
