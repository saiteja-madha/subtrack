import { describe, expect, it } from "vitest";

import { getSpendSummary } from "@/domain/analytics";
import type { Subscription } from "@/domain/types";

function subscription(overrides: Partial<Subscription>): Subscription {
  return {
    id: "sub",
    name: "Subscription",
    priceMinor: 1200,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month",
    nextBillingDate: "2026-08-20",
    status: "active",
    reminderDaysBefore: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getSpendSummary", () => {
  it("groups totals by currency instead of adding unlike currencies", () => {
    const summary = getSpendSummary(
      [
        subscription({ id: "usd", priceMinor: 1200, currency: "USD" }),
        subscription({ id: "eur", priceMinor: 1000, currency: "EUR" }),
        subscription({ id: "paused", priceMinor: 5000, currency: "USD", status: "paused" }),
      ],
      new Date(2026, 7, 10),
    );

    expect(summary.totalsByCurrency).toEqual([
      { currency: "EUR", monthly: 10, yearly: 120 },
      { currency: "USD", monthly: 12, yearly: 144 },
    ]);
    expect(summary.activeCount).toBe(2);
  });
});
