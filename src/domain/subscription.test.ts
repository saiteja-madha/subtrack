import { describe, expect, it } from "vitest";

import { parseAmountToMinor } from "@/constants/currencies";
import {
  presetFromBilling,
  toFormValues,
  validateSubscriptionForm,
  type SubscriptionFormValues,
} from "@/domain/subscription";

function validValues(overrides: Partial<SubscriptionFormValues> = {}): SubscriptionFormValues {
  return {
    name: "Netflix",
    price: "22.99",
    currency: "USD",
    cycle: "monthly",
    customInterval: "1",
    customUnit: "month",
    nextBillingDate: "2026-08-15",
    categoryId: null,
    startDate: null,
    reminderDaysBefore: null,
    notes: "",
    status: "active",
    ...overrides,
  };
}

describe("parseAmountToMinor", () => {
  it("parses whole and fractional amounts", () => {
    expect(parseAmountToMinor("22.99", "USD")).toBe(2299);
    expect(parseAmountToMinor("0.50", "USD")).toBe(50);
    expect(parseAmountToMinor("9", "USD")).toBe(900);
  });

  it("parses zero-decimal currencies as whole units", () => {
    expect(parseAmountToMinor("980", "JPY")).toBe(980);
    expect(parseAmountToMinor("9.5", "JPY")).toBeNull();
  });

  it("rejects invalid input", () => {
    expect(parseAmountToMinor("", "USD")).toBeNull();
    expect(parseAmountToMinor("abc", "USD")).toBeNull();
    expect(parseAmountToMinor("12.999", "USD")).toBeNull();
    expect(parseAmountToMinor("1.2.3", "USD")).toBeNull();
  });
});

describe("validateSubscriptionForm", () => {
  it("accepts a valid form", () => {
    const result = validateSubscriptionForm(validValues());
    expect(result.errors).toEqual({});
    expect(result.draft).toMatchObject({
      name: "Netflix",
      priceMinor: 2299,
      currency: "USD",
      billingInterval: 1,
      billingUnit: "month",
    });
  });

  it("requires a name", () => {
    const result = validateSubscriptionForm(validValues({ name: "   " }));
    expect(result.errors.name).toBeDefined();
    expect(result.draft).toBeUndefined();
  });

  it("requires a positive price", () => {
    expect(validateSubscriptionForm(validValues({ price: "" })).errors.price).toBeDefined();
    expect(validateSubscriptionForm(validValues({ price: "0" })).errors.price).toBeDefined();
  });

  it("validates custom intervals", () => {
    expect(
      validateSubscriptionForm(
        validValues({ cycle: "custom", customInterval: "6", customUnit: "month" }),
      ).draft,
    ).toMatchObject({ billingInterval: 6, billingUnit: "month" });

    expect(
      validateSubscriptionForm(validValues({ cycle: "custom", customInterval: "0" })).errors
        .customInterval,
    ).toBeDefined();

    expect(
      validateSubscriptionForm(validValues({ cycle: "custom", customInterval: "not a number" }))
        .errors.customInterval,
    ).toBeDefined();
  });

  it("requires a valid next billing date", () => {
    expect(
      validateSubscriptionForm(validValues({ nextBillingDate: "" })).errors.nextBillingDate,
    ).toBeDefined();
    expect(
      validateSubscriptionForm(validValues({ nextBillingDate: "not-a-date" })).errors
        .nextBillingDate,
    ).toBeDefined();
  });

  it("normalizes dates to YYYY-MM-DD", () => {
    const result = validateSubscriptionForm(validValues({ nextBillingDate: "2026-08-15" }));
    expect(result.draft?.nextBillingDate).toBe("2026-08-15");
  });

  it("coerces the reminder default to -1 when null", () => {
    const result = validateSubscriptionForm(validValues());
    expect(result.draft?.reminderDaysBefore).toBeNull();
  });
});

describe("presetFromBilling", () => {
  it("recognizes presets and falls back to custom", () => {
    expect(presetFromBilling(1, "month")).toBe("monthly");
    expect(presetFromBilling(1, "week")).toBe("weekly");
    expect(presetFromBilling(3, "month")).toBe("quarterly");
    expect(presetFromBilling(1, "year")).toBe("yearly");
    expect(presetFromBilling(2, "month")).toBe("custom");
  });
});

describe("toFormValues", () => {
  it("round-trips a subscription into form values", () => {
    const values = toFormValues({
      name: "Figma",
      priceMinor: 14400,
      currency: "USD",
      billingInterval: 1,
      billingUnit: "year",
      startDate: "2026-01-01",
      nextBillingDate: "2026-08-15",
      categoryId: "cat-1",
      notes: "Design tool",
      status: "active",
      reminderDaysBefore: 3,
    });
    expect(values).toMatchObject({
      name: "Figma",
      price: "144",
      cycle: "yearly",
      categoryId: "cat-1",
      reminderDaysBefore: 3,
    });
  });

  it("keeps custom interval details", () => {
    const values = toFormValues({
      name: "Gym",
      priceMinor: 6000,
      currency: "USD",
      billingInterval: 6,
      billingUnit: "month",
      nextBillingDate: "2026-08-15",
      status: "active",
    });
    expect(values.cycle).toBe("custom");
    expect(values.customInterval).toBe("6");
    expect(values.customUnit).toBe("month");
  });
});
