import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — Çiftçinin yapay zekâ destekli tarla asistanı`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read once at module scope (Cache Components treats this as build-time data).
const fontDir = join(process.cwd(), "assets", "fonts");
const [latin, latinExt] = await Promise.all([
  readFile(join(fontDir, "space-grotesk-latin-700.woff")),
  readFile(join(fontDir, "space-grotesk-latin-ext-700.woff")),
]);

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
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "#15803d",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            B
          </div>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.15, maxWidth: 1000 }}>{siteConfig.tagline}</div>
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
