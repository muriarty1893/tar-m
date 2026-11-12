import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/sign-in-href";

describe("safeReturnPath", () => {
  it("keeps paths on this site", () => {
    expect(safeReturnPath("/forum/abc?x=1")).toBe("/forum/abc?x=1");
  });
  it("refuses other sites, however they're written", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "/\tevil", "https://evil.com", "evil.com", "", null, 5]) expect(safeReturnPath(bad)).toBe("/");
    expect(safeReturnPath("//evil.com", "")).toBe("");
  });
});
