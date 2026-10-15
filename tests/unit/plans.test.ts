import { describe, it, expect } from "vitest";
import { PLANS, YEARLY_DISCOUNT, yearlyMonthlyPrice } from "@/data/plans";

describe("plans", () => {
  it("takes 20% off the monthly price on the yearly plan, in whole lira", () => {
    expect(YEARLY_DISCOUNT).toBe(0.2);
    expect(yearlyMonthlyPrice(149)).toBe(119);
    expect(yearlyMonthlyPrice(399)).toBe(319);
  });
  it("has one most-popular plan and one quote-only plan", () => {
    expect(PLANS.filter((p) => p.popular).map((p) => p.name)).toEqual(["Profesyonel"]);
    expect(PLANS.filter((p) => p.price === null).map((p) => p.name)).toEqual(["Kurumsal"]);
  });
});
