import { describe, expect, test } from "vitest";
import {
  EMPTY_LISTING,
  canRespond,
  isOwnPhotoUrl,
  marketHref,
  normalizeListing,
  parseMarketQuery,
  priceLabel,
  settledStatus,
  validateListing,
  type ListingInput,
} from "@/lib/market";

const PHOTO = "https://sfl1rhxasno8lh61.public.blob.vercel-storage.com/ilanlar/abc-123.webp";
const valid: ListingInput = {
  ...EMPTY_LISTING,
  title: "2015 model 75 beygir traktör",
  category: "arac",
  condition: "ikinci-el",
  price: "650.000",
  province: "Konya",
  district: "Çumra",
  photos: [PHOTO],
};

describe("listing form", () => {
  test("a complete listing has no errors", () => {
    expect(validateListing(valid)).toEqual({});
  });

  test("says what is missing, field by field", () => {
    const e = validateListing(EMPTY_LISTING);
    expect(Object.keys(e).sort()).toEqual(["category", "price", "province", "title"]);
  });

  test("produce needs a unit but no condition; tools need a condition", () => {
    expect(validateListing({ ...valid, category: "urun", condition: "" })).toEqual({ unit: "Fiyatın birimini seçin." });
    expect(validateListing({ ...valid, category: "urun", condition: "", unit: "ton" })).toEqual({});
    expect(validateListing({ ...valid, category: "alet", condition: "" }).condition).toBeTruthy();
  });

  test("only our own Blob uploads are accepted as photos", () => {
    expect(isOwnPhotoUrl(PHOTO)).toBe(true);
    expect(isOwnPhotoUrl("https://evil.example.com/ilanlar/x.webp")).toBe(false);
    expect(isOwnPhotoUrl("https://abc.public.blob.vercel-storage.com/baska/x.webp")).toBe(false);
    expect(validateListing({ ...valid, photos: ["https://evil.example.com/x.jpg"] }).photos).toBeTruthy();
    expect(validateListing({ ...valid, photos: Array(6).fill(PHOTO) }).photos).toBeTruthy();
  });

  test("an unknown province is refused", () => {
    expect(validateListing({ ...valid, province: "Atlantis" }).province).toBeTruthy();
  });

  test("normalizing: Turkish price, quantity in the unit, folded search text", () => {
    const v = normalizeListing({ ...valid, category: "urun", condition: "sifir", unit: "ton", quantity: "25", price: "11.200", title: "  Ekmeklik   buğday " });
    expect(v.price).toBe(11200);
    expect(v.quantity).toBe("25 ton");
    expect(v.condition).toBeNull();
    expect(v.title).toBe("Ekmeklik buğday");
    expect(v.searchText).toContain("bugday");
    expect(v.searchText).toContain("cumra");
  });

  test("a tractor has no unit or quantity", () => {
    const v = normalizeListing({ ...valid, unit: "ton", quantity: "3" });
    expect(v.unit).toBeNull();
    expect(v.quantity).toBeNull();
  });

  test("price labels", () => {
    expect(priceLabel(650000)).toBe("650.000 ₺");
    expect(priceLabel(11200, "ton")).toBe("11.200 ₺ / ton");
  });
});

describe("Pazar filters in the URL", () => {
  test("unknown values fall back to the defaults", () => {
    expect(parseMarketQuery({ kategori: "uzay", sirala: "x", il: "Atlantis", sayfa: "-3", gorunum: "?" })).toEqual({
      q: "",
      kategori: "tumu",
      il: "",
      sirala: "yeni",
      gorunum: "tumu",
      sayfa: 1,
    });
  });

  test("round trip, with defaults left out and the page reset on change", () => {
    const q = parseMarketQuery({ q: "traktör", kategori: "arac", il: "Konya", sayfa: "3" });
    expect(q.sayfa).toBe(3);
    expect(marketHref(q)).toBe("/pazar?q=trakt%C3%B6r&kategori=arac&il=Konya");
    expect(marketHref(q, { sayfa: 2 })).toContain("sayfa=2");
    expect(marketHref(parseMarketQuery({}))).toBe("/pazar");
  });
});

describe("offers", () => {
  test("only the other person answers, and only while it waits", () => {
    expect(canRespond({ senderId: "buyer", status: "pending" }, "seller")).toBe(true);
    expect(canRespond({ senderId: "buyer", status: "pending" }, "buyer")).toBe(false);
    expect(canRespond({ senderId: "buyer", status: "accepted" }, "seller")).toBe(false);
  });

  test("a new offer replaces my waiting one and counters theirs", () => {
    expect(settledStatus("me", "me")).toBe("withdrawn");
    expect(settledStatus("them", "me")).toBe("countered");
  });
});
