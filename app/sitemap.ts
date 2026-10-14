import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/news";
import { siteUrl } from "@/lib/site-url";

const STATIC_ROUTES = ["", "/haberler", "/hava", "/is-birligi", "/sss", "/hakkimizda", "/gizlilik", "/kaynaklar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${siteUrl}${path}` })),
    ...articles.map((a) => ({ url: `${siteUrl}/haberler/${a.slug}`, lastModified: a.date })),
  ];
}
