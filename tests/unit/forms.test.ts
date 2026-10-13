import { describe, it, expect } from "vitest";
import { waitlistSchema, partnerSchema, questionSchema, neutraliseFormula } from "@/lib/forms";

const waitlist = (over: Record<string, unknown> = {}) => ({
  name: "Ayşe Yılmaz",
  email: "ayse@example.com",
  city: "Konya",
  crop: "Buğday",
  consent: true,
  website: "",
  ...over,
});

const partner = (over: Record<string, unknown> = {}) => ({
  name: "Mehmet Demir",
  organization: "Konya Tarım Kooperatifi",
  email: "mehmet@example.com",
  phone: "+90 532 000 00 00",
  type: "kooperatif",
  message: "Pilot çalışma için görüşmek isteriz.",
  website: "",
  ...over,
});

describe("waitlistSchema", () => {
  it("accepts Turkish names", () => {
    expect(waitlistSchema.safeParse(waitlist({ name: "Şükrü Çağlar" })).success).toBe(true);
  });

  it("rejects a whitespace-only name", () => {
    expect(waitlistSchema.safeParse(waitlist({ name: "   " })).success).toBe(false);
  });

  it("trims and lowercases the email", () => {
    const r = waitlistSchema.safeParse(waitlist({ email: "  Ali@Example.COM " }));
    expect(r.success && r.data.email).toBe("ali@example.com");
  });

  it("rejects an invalid email", () => {
    expect(waitlistSchema.safeParse(waitlist({ email: "ali@" })).success).toBe(false);
  });

  it("requires consent to be exactly true", () => {
    expect(waitlistSchema.safeParse(waitlist({ consent: false })).success).toBe(false);
    expect(waitlistSchema.safeParse(waitlist({ consent: "true" })).success).toBe(false);
  });

  it("allows city and crop to be omitted", () => {
    const withoutOptional = { name: "Ali Kaya", email: "ali@example.com", consent: true };
    expect(waitlistSchema.safeParse(withoutOptional).success).toBe(true);
  });

  it("gives a Turkish message for a missing name", () => {
    const r = waitlistSchema.safeParse(waitlist({ name: "" }));
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/ad/i);
  });
});

describe("partnerSchema", () => {
  it("accepts a valid partner message", () => {
    expect(partnerSchema.safeParse(partner()).success).toBe(true);
  });

  it("rejects a 2001-character message and accepts 2000", () => {
    expect(partnerSchema.safeParse(partner({ message: "a".repeat(2001) })).success).toBe(false);
    expect(partnerSchema.safeParse(partner({ message: "a".repeat(2000) })).success).toBe(true);
  });

  it("rejects an unknown partner type", () => {
    expect(partnerSchema.safeParse(partner({ type: "hacker" })).success).toBe(false);
  });

  it("rejects a phone with letters", () => {
    expect(partnerSchema.safeParse(partner({ phone: "call me" })).success).toBe(false);
  });
});

describe("neutraliseFormula", () => {
  it("prefixes values that a spreadsheet would run as a formula", () => {
    expect(neutraliseFormula("=HYPERLINK(\"x\")")).toBe("'=HYPERLINK(\"x\")");
    expect(neutraliseFormula("+90 532")).toBe("'+90 532");
    expect(neutraliseFormula("-1")).toBe("'-1");
    expect(neutraliseFormula("@foo")).toBe("'@foo");
  });

  it("leaves normal text alone", () => {
    expect(neutraliseFormula("Konya")).toBe("Konya");
  });
});

const question = (over: Record<string, unknown> = {}) => ({
  name: "Hasan Kaya",
  email: "hasan@example.com",
  question: "Uygulama hangi ürünleri tanıyacak?",
  consent: true,
  website: "",
  ...over,
});

describe("questionSchema", () => {
  it("accepts a question with an email and consent", () => {
    expect(questionSchema.safeParse(question()).success).toBe(true);
  });

  it("allows the name to be left out", () => {
    expect(questionSchema.safeParse(question({ name: undefined })).success).toBe(true);
  });

  it("needs an email so the team can answer", () => {
    expect(questionSchema.safeParse(question({ email: "" })).success).toBe(false);
  });

  it("rejects a question shorter than 10 characters, with a Turkish message", () => {
    const r = questionSchema.safeParse(question({ question: "Neden?" }));
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues[0].message).toBe("Sorunuz en az 10 karakter olmalı.");
  });

  it("caps the question at 1000 characters", () => {
    expect(questionSchema.safeParse(question({ question: "a".repeat(1001) })).success).toBe(false);
  });

  it("requires KVKK consent", () => {
    expect(questionSchema.safeParse(question({ consent: false })).success).toBe(false);
  });
});
