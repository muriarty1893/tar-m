import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/news-data";
import { siteUrl } from "@/lib/site-url";

const STATIC_ROUTES = ["", "/pazar", "/pazar/kurallar", "/fiyatlar", "/hava", "/takvim", "/tarlalarim", "/haberler", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublished();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${siteUrl}${path}` })),
    ...articles.map((a) => ({ url: `${siteUrl}/haberler/${a.slug}`, lastModified: a.date })),
  ];
}
