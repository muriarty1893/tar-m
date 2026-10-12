import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { demoScenarios } from "@/data/demo-scenarios";
import { photoCredits } from "@/data/photo-credits";

const publicFiles = (dir: string) => fs.readdirSync(path.join(process.cwd(), "public", dir)).map((f) => `/${dir}/${f}`);

describe("photo credits", () => {
  it("credits every photo shipped in public/demo and public/app", () => {
    const credited = new Set(photoCredits.map((c) => c.src));
    for (const f of [...publicFiles("demo"), ...publicFiles("app")]) expect(credited, f).toContain(f);
  });

  it("credits every demo scenario image", () => {
    const credited = new Set(photoCredits.map((c) => c.src));
    for (const s of demoScenarios) expect(credited).toContain(s.imageSrc);
  });

  it("names the author and links the license for every CC BY photo", () => {
    for (const c of photoCredits.filter((c) => c.license.startsWith("CC BY"))) {
      expect(c.author.trim(), c.src).not.toBe("");
      expect(c.licenseUrl, c.src).toMatch(/^https:\/\/creativecommons\.org\/licenses\/by\//);
    }
    for (const c of photoCredits) expect(c.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  });
});
