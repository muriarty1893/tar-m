import { describe, expect, it } from "vitest";
import { adFreePath, adsTxt } from "@/lib/ads";

describe("AdSense helpers", () => {
  it("writes the ads.txt line with the pub- id", () => {
    expect(adsTxt("ca-pub-1234567890123456")).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  });

  it("keeps ads off sign-in, account, messages and admin pages", () => {
    for (const p of ["/yonetim", "/yonetim/rapor", "/giris", "/kayit", "/hesabim", "/mesajlar/abc", "/tasarimlar/17"]) expect(adFreePath(p)).toBe(true);
    for (const p of ["/", "/forum", "/forum/x", "/pazar", "/haberler/abc", "/girisimci"]) expect(adFreePath(p)).toBe(false);
  });
});
