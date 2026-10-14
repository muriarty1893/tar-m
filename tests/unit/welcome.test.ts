import { describe, it, expect } from "vitest";
import { sourceSchema } from "@/lib/forms";
import { WELCOME_SOURCES } from "@/lib/welcome";

describe("welcome question", () => {
  it("offers a short list of answers including 'Diğer'", () => {
    expect(WELCOME_SOURCES.length).toBeGreaterThanOrEqual(4);
    expect(WELCOME_SOURCES.length).toBeLessThanOrEqual(7);
    expect(WELCOME_SOURCES.at(-1)!.label).toBe("Diğer");
  });
  it("accepts only a listed answer", () => {
    expect(sourceSchema.safeParse({ source: WELCOME_SOURCES[0].id }).success).toBe(true);
    expect(sourceSchema.safeParse({ source: "" }).success).toBe(false);
    expect(sourceSchema.safeParse({}).success).toBe(false);
    expect(sourceSchema.safeParse({ source: "uydurma" }).success).toBe(false);
  });
});
