import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/mesajlar", "/hesabim", "/yonetim", "/giris", "/kayit", "/pazar/ilan-ver"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
