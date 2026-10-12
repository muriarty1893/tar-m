import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as waitlistPOST } from "@/app/api/waitlist/route";
import { POST as partnerPOST } from "@/app/api/partner/route";

let ipCounter = 0;
const freshIp = () => `10.0.0.${++ipCounter}`;

const req = (body: unknown, ip = freshIp(), raw?: string) =>
  new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 70.0.0.1` },
    body: raw ?? JSON.stringify(body),
  });

const validWaitlist = (over: Record<string, unknown> = {}) => ({
  name: "Ayşe Yılmaz",
  email: "Ayse@Example.com",
  city: "=Konya",
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

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv("APPS_SCRIPT_URL", "https://script.example/exec");
  vi.stubEnv("APPS_SCRIPT_SECRET", "s3cret");
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);

describe("POST /api/waitlist", () => {
  it("forwards a valid submission once and returns ok", async () => {
    const res = await waitlistPOST(req(validWaitlist()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://script.example/exec");
    const body = sentBody();
    expect(body).toMatchObject({ sheet: "waitlist", secret: "s3cret", email: "ayse@example.com", name: "Ayşe Yılmaz" });
    expect(body.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.website).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("neutralises spreadsheet formulas before forwarding", async () => {
    await waitlistPOST(req(validWaitlist()));
    expect(sentBody().city).toBe("'=Konya");
  });

  it("returns fake success without forwarding when the honeypot is filled", async () => {
    const res = await waitlistPOST(req(validWaitlist({ website: "http://spam" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body", async () => {
    const res = await waitlistPOST(req(validWaitlist({ consent: false })));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: "validation" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await waitlistPOST(req(null, freshIp(), "{not json"));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an oversized body", async () => {
    const res = await waitlistPOST(req(validWaitlist({ crop: "x".repeat(20_000) })));
    expect(res.status).toBe(400);
  });

  it("allows 20 requests per IP (a shared cooperative Wi-Fi) and returns 429 on the 21st", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) {
      expect((await waitlistPOST(req(validWaitlist(), ip))).status).toBe(200);
    }
    const res = await waitlistPOST(req(validWaitlist(), ip));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "rate" });
  });

  it("returns 502 when the upstream returns 500", async () => {
    fetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
    const res = await waitlistPOST(req(validWaitlist()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: "upstream" });
  });

  it("returns 502 when the upstream times out", async () => {
    fetchMock.mockRejectedValueOnce(new DOMException("The operation timed out.", "TimeoutError"));
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(502);
  });

  it("returns 502 when the Apps Script reports an error in its body", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false }), { status: 200 }));
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(502);
  });

  it("returns 502 when the Apps Script answers 200 with an HTML error page", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>Script function not found</html>", { status: 200 }));
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(502);
  });

  it("returns 502 when APPS_SCRIPT_URL is not configured", async () => {
    vi.stubEnv("APPS_SCRIPT_URL", "");
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts duplicate email submissions", async () => {
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(200);
    expect((await waitlistPOST(req(validWaitlist()))).status).toBe(200);
  });
});

describe("POST /api/partner", () => {
  it("forwards to the partner sheet", async () => {
    const res = await partnerPOST(req(validPartner));
    expect(res.status).toBe(200);
    expect(sentBody()).toMatchObject({ sheet: "partner", type: "kooperatif" });
  });

  it("rate-limits separately from the waitlist", async () => {
    const ip = freshIp();
    for (let i = 0; i < 20; i++) await waitlistPOST(req(validWaitlist(), ip));
    expect((await partnerPOST(req(validPartner, ip))).status).toBe(200);
  });
});
