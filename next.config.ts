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
      // Profile photos (lib/avatars.ts), served by Clerk.
      { protocol: "https", hostname: "img.clerk.com" },
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
  // Basic protections on every response. Frames: only the site itself (/tasarimlar shows its own pages
  // in frames), so another site can't overlay ours to trick clicks. Location: the weather widget only.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
  // The site was called "Bereket AI" before; its launch article's address followed the old name.
  async redirects() {
    return [{ source: "/haberler/bereket-ai-erken-erisim", destination: "/haberler/ciftci-destek-erken-erisim", permanent: true }];
  },
};

export default nextConfig;
