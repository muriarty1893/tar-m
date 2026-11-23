import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
const query = vi.hoisted(() => vi.fn<(...args: unknown[]) => Promise<unknown[]>>(async () => []));
vi.mock("@/lib/db", () => ({ sql: () => query, iso: (v: unknown) => String(v) }));

import { saveSubmission } from "@/lib/services/submissions";

beforeEach(() => {
  query.mockReset();
  query.mockResolvedValue([]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("saveSubmission", () => {
  it("stores the kind and the filled-in fields, without the honeypot, the consent tick or empty ones", async () => {
    expect(await saveSubmission("question", { name: "Ayşe", email: "a@example.com", phone: "", website: "", consent: true, question: "Ne zaman?" })).toBe(true);
    const values = query.mock.calls[0].slice(1);
    expect(values[0]).toBe("question");
    expect(JSON.parse(values[1] as string)).toEqual({ name: "Ayşe", email: "a@example.com", question: "Ne zaman?" });
  });

  it("reports false when the database fails, so the visitor sees an error", async () => {
    query.mockRejectedValueOnce(new Error("down"));
    expect(await saveSubmission("partner", { name: "x" })).toBe(false);
  });
});
