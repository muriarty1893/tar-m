import { ADSENSE_CLIENT, adsTxt } from "@/lib/ads";

/** /ads.txt: tells ad buyers that Google may sell this site's ad space. Only when AdSense is on. */
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(adsTxt(ADSENSE_CLIENT), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
