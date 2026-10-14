import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.join(__dirname, "..", "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

// UI UX Pro Max rule: SVG icons (Phosphor), never emoji, in the interface.
describe("interface icons", () => {
  it("uses no emoji characters in app/ or components/", () => {
    // Emoji-presentation characters, or any pictograph forced to emoji style with U+FE0F.
    // Plain text symbols such as © are allowed.
    const emoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u;
    expect(emoji.test("📷")).toBe(true);
    expect(emoji.test("❄️")).toBe(true);
    expect(emoji.test("✅")).toBe(true);
    expect(emoji.test("© 2026")).toBe(false);
    const offenders = ["app", "components"]
      .flatMap((d) => sourceFiles(path.join(root, d)))
      .flatMap((f) =>
        fs
          .readFileSync(f, "utf8")
          .split("\n")
          .map((line, i) => ({ line, i }))
          // The owner asked for one emoji: the heart in the footer's maker credit (marked data-allow-emoji).
          .filter(({ line }, i, all) => emoji.test(line) && !(f.endsWith(path.join("components", "Footer.tsx")) && all[i - 1]?.line.includes("data-allow-emoji")))
          .map(({ i }) => `${path.relative(root, f)}:${i + 1}`),
      );
    expect(offenders).toEqual([]);
  });
});
