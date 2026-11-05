import { describe, it, expect } from "vitest";
import { partnerSchema, questionSchema, neutraliseFormula } from "@/lib/forms";

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

describe("shared fields", () => {
  const question = (over: Record<string, unknown> = {}) => ({ name: "Ayşe", email: "ayse@example.com", question: "Buğday ekimi ne zaman yapılır?", consent: true, website: "", ...over });

  it("trims and lowercases the email", () => {
    const r = questionSchema.safeParse(question({ email: "  Ali@Example.COM " }));
    expect(r.success && r.data.email).toBe("ali@example.com");
  });

  it("rejects an invalid email", () => {
    expect(questionSchema.safeParse(question({ email: "ali@" })).success).toBe(false);
  });

  it("requires consent to be exactly true", () => {
    expect(questionSchema.safeParse(question({ consent: false })).success).toBe(false);
    expect(questionSchema.safeParse(question({ consent: "true" })).success).toBe(false);
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
