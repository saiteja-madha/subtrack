import { describe, expect, it } from "vitest";

import {
  addBillingInterval,
  billingCycleLabel,
  computeNextBillingDate,
  getMonthlyEquivalent,
  getUpcomingRenewals,
  getYearlyEquivalent,
  groupUpcomingRenewals,
  periodsPerYear,
} from "@/domain/billing";
import type { Subscription } from "@/domain/types";

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    name: "Netflix",
    priceMinor: 2299,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month",
    startDate: "2026-01-01",
    nextBillingDate: "2026-08-15",
    categoryId: null,
    notes: null,
    status: "active",
    reminderDaysBefore: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("periodsPerYear", () => {
  it("returns the number of periods in a year", () => {
    expect(periodsPerYear("day")).toBe(365);
    expect(periodsPerYear("week")).toBe(52);
    expect(periodsPerYear("month")).toBe(12);
    expect(periodsPerYear("year")).toBe(1);
  });
});

describe("getMonthlyEquivalent / getYearlyEquivalent", () => {
  it("converts monthly price to monthly and yearly equivalents", () => {
    const sub = makeSub({ priceMinor: 1200, billingInterval: 1, billingUnit: "month" });
    expect(getMonthlyEquivalent(sub)).toBeCloseTo(12, 5);
    expect(getYearlyEquivalent(sub)).toBeCloseTo(144, 5);
  });

  it("converts a yearly subscription to a monthly equivalent", () => {
    const sub = makeSub({ priceMinor: 12000, billingInterval: 1, billingUnit: "year" });
    expect(getMonthlyEquivalent(sub)).toBeCloseTo(10, 5);
    expect(getYearlyEquivalent(sub)).toBeCloseTo(120, 5);
  });

  it("handles custom intervals (every 3 months)", () => {
    const sub = makeSub({ priceMinor: 3000, billingInterval: 3, billingUnit: "month" });
    expect(getMonthlyEquivalent(sub)).toBeCloseTo(10, 5);
  });

  it("handles zero-decimal currencies (JPY)", () => {
    const sub = makeSub({
      priceMinor: 980,
      currency: "JPY",
      billingInterval: 1,
      billingUnit: "month",
    });
    expect(getMonthlyEquivalent(sub)).toBeCloseTo(980, 5);
  });
});

describe("addBillingInterval", () => {
  it("advances by days and weeks", () => {
    const base = new Date(2026, 0, 15);
    expect(addBillingInterval(base, 2, "day")).toEqual(new Date(2026, 0, 17));
    expect(addBillingInterval(base, 3, "week")).toEqual(new Date(2026, 1, 5));
  });

  it("clamps to the last day of shorter months", () => {
    expect(addBillingInterval(new Date(2026, 0, 31), 1, "month")).toEqual(new Date(2026, 1, 28));
    expect(addBillingInterval(new Date(2026, 0, 31), 2, "month")).toEqual(new Date(2026, 2, 31));
  });

  it("handles leap years (2024-02-29 + 1 year)", () => {
    expect(addBillingInterval(new Date(2024, 1, 29), 1, "year")).toEqual(new Date(2025, 1, 28));
  });
});

describe("computeNextBillingDate", () => {
  it("returns the stored date when it is today or in the future", () => {
    const from = new Date(2026, 7, 10);
    expect(computeNextBillingDate("2026-08-15", 1, "month", from)).toEqual(new Date(2026, 7, 15));
  });

  it("advances an overdue monthly subscription by whole periods", () => {
    const from = new Date(2026, 9, 20);
    // Periods: Aug 15, Sep 15, Oct 15 (past on Oct 20), Nov 15 (next).
    expect(computeNextBillingDate("2026-08-15", 1, "month", from)).toEqual(new Date(2026, 10, 15));
  });

  it("advances an overdue weekly subscription", () => {
    const from = new Date(2026, 7, 20);
    // 2026-08-15 is a Saturday; from is Thursday 2026-08-20.
    expect(computeNextBillingDate("2026-08-15", 1, "week", from)).toEqual(new Date(2026, 7, 22));
  });

  it("does not mutate the stored value for overdue dates", () => {
    const from = new Date(2026, 9, 20);
    const next = computeNextBillingDate("2026-08-15", 1, "month", from);
    expect(next.getTime()).toBeGreaterThanOrEqual(from.getTime());
  });
});

describe("getUpcomingRenewals", () => {
  it("returns renewals for active subscriptions sorted by date", () => {
    const a = makeSub({ id: "a", name: "A", nextBillingDate: "2026-08-20" });
    const b = makeSub({ id: "b", name: "B", nextBillingDate: "2026-08-10" });
    const renewals = getUpcomingRenewals([a, b], { from: new Date(2026, 7, 1) });
    expect(renewals.map((r) => r.subscription.id)).toEqual(["b", "a"]);
  });

  it("excludes paused and cancelled subscriptions", () => {
    const active = makeSub({ id: "a", name: "A", nextBillingDate: "2026-08-10" });
    const paused = makeSub({ id: "p", status: "paused", nextBillingDate: "2026-08-10" });
    const cancelled = makeSub({ id: "c", status: "cancelled", nextBillingDate: "2026-08-10" });
    const renewals = getUpcomingRenewals([active, paused, cancelled], {
      from: new Date(2026, 7, 1),
    });
    expect(renewals).toHaveLength(1);
    expect(renewals[0].subscription.id).toBe("a");
  });

  it("advances overdue subscriptions to their next effective date", () => {
    const sub = makeSub({ nextBillingDate: "2026-08-15" });
    const from = new Date(2026, 9, 20);
    const renewals = getUpcomingRenewals([sub], { from });
    expect(renewals[0].date.getTime()).toBeGreaterThanOrEqual(from.getTime());
  });

  it("respects the until bound", () => {
    const sub = makeSub({ nextBillingDate: "2026-08-15" });
    const renewals = getUpcomingRenewals([sub], {
      from: new Date(2026, 7, 1),
      until: new Date(2026, 7, 14),
    });
    expect(renewals).toHaveLength(0);
  });
});

describe("groupUpcomingRenewals", () => {
  it("groups into today/tomorrow/week/month/later buckets", () => {
    const from = new Date(2026, 7, 10); // Monday
    const subs = [
      makeSub({ id: "today", nextBillingDate: "2026-08-10" }),
      makeSub({ id: "tomorrow", nextBillingDate: "2026-08-11" }),
      makeSub({ id: "week", nextBillingDate: "2026-08-13" }),
      makeSub({ id: "month", nextBillingDate: "2026-08-25" }),
      makeSub({ id: "later", nextBillingDate: "2026-09-20" }),
    ];
    const groups = groupUpcomingRenewals(subs, from);
    expect(groups.today.map((r) => r.subscription.id)).toEqual(["today"]);
    expect(groups.tomorrow.map((r) => r.subscription.id)).toEqual(["tomorrow"]);
    expect(groups.week.map((r) => r.subscription.id)).toEqual(["week"]);
    expect(groups.month.map((r) => r.subscription.id)).toEqual(["month"]);
    expect(groups.later.map((r) => r.subscription.id)).toEqual(["later"]);
  });
});

describe("billingCycleLabel", () => {
  it("describes standard cycles", () => {
    expect(billingCycleLabel(1, "day")).toBe("Daily");
    expect(billingCycleLabel(1, "week")).toBe("Weekly");
    expect(billingCycleLabel(1, "month")).toBe("Monthly");
    expect(billingCycleLabel(1, "year")).toBe("Yearly");
  });

  it("describes custom cycles", () => {
    expect(billingCycleLabel(2, "week")).toBe("Every 2 weeks");
    expect(billingCycleLabel(3, "month")).toBe("Every 3 months");
  });
});
