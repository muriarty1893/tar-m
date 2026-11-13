import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

const { cleanSlot, isSlotUrl, validateSlot } = await import("@/lib/site-slots");

describe("ad slot links", () => {
  it("allow pages on this site and https addresses", () => {
    for (const ok of ["", "/is-birligi", "https://sukocu.com", "https://ornek.com.tr/urun?x=1"]) expect(isSlotUrl(ok)).toBe(true);
  });
  it("refuse scripts, plain http and other sites written as paths", () => {
    for (const bad of ["javascript:alert(1)", "http://sukocu.com", "//evil.com", "/\\evil.com", "data:text/html,x", "sukocu.com"]) expect(isSlotUrl(bad)).toBe(false);
  });
});

describe("ad slot form", () => {
  it("needs a name and text for a switched-on sponsor, and a page for the reklam box", () => {
    expect(validateSlot("sponsor", cleanSlot({ enabled: true, name: "", text: "" }))).toEqual({ name: "Sponsorun adını yazın.", text: "Gösterilecek yazıyı girin." });
    expect(validateSlot("reklam", cleanSlot({ enabled: true, name: "İletişim", text: "Reklam verin", url: "" }))).toHaveProperty("url");
  });
  it("lets a switched-off slot be empty", () => {
    expect(validateSlot("sponsor", cleanSlot({ enabled: false }))).toEqual({});
  });
  it("tidies spaces and reads checkbox values", () => {
    expect(cleanSlot({ enabled: "on", name: "  sukocu.com  ", text: "a   b", sample: true })).toEqual({ enabled: true, name: "sukocu.com", text: "a b", url: "", sample: true });
  });
});
