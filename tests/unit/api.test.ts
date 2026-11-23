import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));
const save = vi.hoisted(() => vi.fn<(...args: unknown[]) => Promise<boolean>>(async () => true));
vi.mock("@/lib/services/submissions", () => ({ saveSubmission: save }));
import { POST as partnerPOST } from "@/app/api/partner/route";
import { POST as questionPOST } from "@/app/api/question/route";

let ipCounter = 0;
const freshIp = () => `10.0.0.${++ipCounter}`;

const req = (body: unknown, ip = freshIp(), raw?: string) =>
  new Request("http://localhost/api/question", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 70.0.0.1` },
    body: raw ?? JSON.stringify(body),
  });

// The shared form handling (honeypot, limits, storage errors) is tested through
// the question form; every form goes through the same handler (lib/submit.ts).
const validQuestion = (over: Record<string, unknown> = {}) => ({
  name: "=Ayşe",
  email: "Ayse@Example.com",
  question: "Buğday ekimi için en uygun ay hangisi?",
  consent: true,
  website: "",
  ...over,
});

const validPartner = {
  name: "Mehmet Demir",
  organization: "Kooperatif",
  email: "m@example.com",
  type: "kooperatif",
  message: "Pilot çalışma için görüşmek isteriz.",
  website: "",
};

beforeEach(() => {
  save.mockClear();
  save.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const saved = () => save.mock.calls[0] as [string, Record<string, unknown>];

describe("form submissions (POST /api/question)", () => {
  it("saves a valid submission once and returns ok", async () => {
    const res = await questionPOST(req(validQuestion()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(save).toHaveBeenCalledTimes(1);
    const [kind, fields] = saved();
    expect(kind).toBe("question");
    expect(fields).toMatchObject({ email: "ayse@example.com", name: "=Ayşe" });
    expect(fields.website).toBeUndefined();
  });

  it("returns fake success without saving when the honeypot is filled", async () => {
    const res = await questionPOST(req(validQuestion({ website: "http://spam" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(save).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body", async () => {
    const res = await questionPOST(req(validQuestion({ consent: false })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: "validation" });
    expect(save).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await questionPOST(req(null, freshIp(), "{not json"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an oversized body", async () => {
    const res = await questionPOST(req(validQuestion({ name: "x".repeat(20_000) })));
    expect(res.status).toBe(400);
  });

  it("allows 20 requests per IP (a shared cooperative Wi-Fi) and returns 429 on the 21st", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) {
      expect((await questionPOST(req(validQuestion(), ip))).status).toBe(200);
    }
    const res = await questionPOST(req(validQuestion(), ip));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "rate" });
  });

  it("returns 502 when the database can't take it", async () => {
    save.mockResolvedValueOnce(false);
    const res = await questionPOST(req(validQuestion()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: "upstream" });
  });

  it("accepts duplicate email submissions", async () => {
    expect((await questionPOST(req(validQuestion()))).status).toBe(200);
    expect((await questionPOST(req(validQuestion()))).status).toBe(200);
  });
});

describe("POST /api/partner", () => {
  it("saves it as a partner message", async () => {
    const res = await partnerPOST(req(validPartner));
    expect(res.status).toBe(200);
    expect(saved()[0]).toBe("partner");
    expect(saved()[1]).toMatchObject({ type: "kooperatif", organization: "Kooperatif" });
  });

  it("rate-limits separately from the question form", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) await questionPOST(req(validQuestion(), ip));
    expect((await partnerPOST(req(validPartner, ip))).status).toBe(200);
  });
});

describe("POST /api/question", () => {
  it("saves the question text", async () => {
    const res = await questionPOST(req(validQuestion()));
    expect(res.status).toBe(200);
    expect(saved()[1].question).toBe(validQuestion().question);
  });

  it("returns 400 with a field error for a too-short question", async () => {
    const res = await questionPOST(req(validQuestion({ question: "Neden?" })));
    expect(res.status).toBe(400);
    expect((await res.json()).fields.question).toBe("Sorunuz en az 10 karakter olmalı.");
    expect(save).not.toHaveBeenCalled();
  });
});
