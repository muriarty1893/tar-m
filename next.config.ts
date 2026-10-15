import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
