import { describe, it, expect } from "vitest";
import { ANALYSIS_MS } from "@/lib/phone-stage";

describe("ANALYSIS_MS", () => {
  it("is the demo's 2 s scan (the real app's AI call will take 3 s or more)", () => {
    expect(ANALYSIS_MS).toBe(2000);
  });
});
