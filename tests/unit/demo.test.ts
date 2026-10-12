import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { demoScenarios } from "@/data/demo-scenarios";

describe("demoScenarios", () => {
  it("has exactly 4 scenarios with unique ids", () => {
    expect(demoScenarios).toHaveLength(4);
    expect(new Set(demoScenarios.map((s) => s.id)).size).toBe(4);
  });

  it("keeps every success rate an integer between 0 and 100", () => {
    for (const s of demoScenarios) {
      expect(Number.isInteger(s.successRate)).toBe(true);
      expect(s.successRate).toBeGreaterThanOrEqual(0);
      expect(s.successRate).toBeLessThanOrEqual(100);
    }
  });

  it("gives every scenario 2-3 suggestions and non-empty text", () => {
    for (const s of demoScenarios) {
      expect(s.suggestions.length).toBeGreaterThanOrEqual(2);
      expect(s.suggestions.length).toBeLessThanOrEqual(3);
      for (const text of [s.title, s.imageAlt, s.seen, s.diagnosis, ...s.suggestions]) {
        expect(text.trim()).not.toBe("");
      }
    }
  });

  it("points every image at a file that exists under public/", () => {
    for (const s of demoScenarios) {
      expect(s.imageSrc.startsWith("/")).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "public", s.imageSrc))).toBe(true);
    }
  });
});
