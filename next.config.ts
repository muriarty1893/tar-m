import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Listing photos and news covers are uploaded to Vercel Blob (public store).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/ilanlar/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/haberler/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/forum/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The site was called "Bereket AI" before; its launch article's address followed the old name.
  async redirects() {
    return [{ source: "/haberler/bereket-ai-erken-erisim", destination: "/haberler/ciftci-destek-erken-erisim", permanent: true }];
  },
};

export default nextConfig;
