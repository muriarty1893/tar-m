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
  readFile(join(fontDir, "nunito-latin-800.woff")),
  readFile(join(fontDir, "nunito-latin-ext-800.woff")),
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
          background: "linear-gradient(135deg, #faf6ee 0%, #f6e7c1 60%, #e9d08a 100%)",
          color: "#3b2a1e",
          fontFamily: "Nunito, NunitoExt",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 48, color: "#2f6b3a" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "#2f6b3a",
              color: "#f6e7c1",
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
        <div style={{ display: "flex", fontSize: 32, color: "#2f6b3a" }}>
          Hastalık tespiti · Hasat başarı tahmini · Çiftçiye özel hava uyarıları
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nunito", data: latin, weight: 800, style: "normal" },
        { name: "NunitoExt", data: latinExt, weight: 800, style: "normal" },
      ],
    },
  );
}
