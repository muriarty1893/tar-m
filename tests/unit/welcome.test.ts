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

describe("welcome question: 'Diğer'", () => {
  it("needs the visitor to write where, when they pick 'Diğer'", () => {
    expect(sourceSchema.safeParse({ source: "diger" }).success).toBe(false);
    expect(sourceSchema.safeParse({ source: "diger", other: "  " }).success).toBe(false);
    expect(sourceSchema.safeParse({ source: "diger", other: "Tarım fuarı" }).success).toBe(true);
  });
  it("ignores the text box for the other answers", () => {
    expect(sourceSchema.safeParse({ source: "arkadas" }).success).toBe(true);
  });
  it("caps the text at 100 characters", () => {
    expect(sourceSchema.safeParse({ source: "diger", other: "a".repeat(101) }).success).toBe(false);
  });
});
