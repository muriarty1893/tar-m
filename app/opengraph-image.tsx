import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once at module scope (Cache Components treats this as build-time data).
const fontDir = join(process.cwd(), "assets", "fonts");
const [latin, latinExt, logo] = await Promise.all([
  readFile(join(fontDir, "space-grotesk-latin-700.woff")),
  readFile(join(fontDir, "space-grotesk-latin-ext-700.woff")),
  readFile(join(process.cwd(), "assets", "brand-logo.png")),
]);
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #bbf7d0 100%)",
          color: "#14532d",
          fontFamily: "SG, SGExt",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 48, color: "#15803d" }}>
          <img src={logoSrc} alt="" width={96} height={96} />
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", fontSize: 96, lineHeight: 1.1, maxWidth: 1000 }}>{siteConfig.tagline}</div>
        <div style={{ display: "flex", fontSize: 32, color: "#15803d" }}>
          Hastalık tespiti · Hasat başarı tahmini · Çiftçiye özel hava uyarıları
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "SG", data: latin, weight: 700, style: "normal" },
        { name: "SGExt", data: latinExt, weight: 700, style: "normal" },
      ],
    },
  );
}
