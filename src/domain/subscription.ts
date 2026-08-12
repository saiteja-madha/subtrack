import { formatISO, parseISO } from "date-fns";

import { getCurrencyInfo, MAX_PRICE_MINOR, parseAmountToMinor } from "@/constants/currencies";
import type { BillingUnit, SubscriptionStatus } from "@/domain/types";

export type BillingCyclePreset = "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export const BILLING_CYCLE_PRESETS: Array<{
  value: BillingCyclePreset;
  label: string;
}> = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

export const CUSTOM_UNITS: Array<{ value: BillingUnit; label: string }> = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
  { value: "year", label: "Years" },
];

const PRESET_INTERVAL: Record<
  Exclude<BillingCyclePreset, "custom">,
  { interval: number; unit: BillingUnit }
> = {
  weekly: { interval: 1, unit: "week" },
  monthly: { interval: 1, unit: "month" },
  quarterly: { interval: 3, unit: "month" },
  yearly: { interval: 1, unit: "year" },
};

export function presetFromBilling(interval: number, unit: BillingUnit): BillingCyclePreset {
  const preset = (
    Object.keys(PRESET_INTERVAL) as Array<Exclude<BillingCyclePreset, "custom">>
  ).find((key) => PRESET_INTERVAL[key].interval === interval && PRESET_INTERVAL[key].unit === unit);
  return preset ?? "custom";
}

export interface SubscriptionFormValues {
  name: string;
  price: string;
  currency: string;
  cycle: BillingCyclePreset;
  customInterval: string;
  customUnit: BillingUnit;
  nextBillingDate: string;
  categoryId: string | null;
  startDate: string | null;
  reminderDaysBefore: number | null;
  notes: string;
  status: SubscriptionStatus;
}

export interface SubscriptionDraft {
  name: string;
  priceMinor: number;
  currency: string;
  billingInterval: number;
  billingUnit: BillingUnit;
  startDate?: string | null;
  nextBillingDate: string;
  categoryId?: string | null;
  notes?: string | null;
  status: SubscriptionStatus;
  reminderDaysBefore?: number | null;
}

export type FormErrors = Partial<Record<string, string>>;

const MAX_INTERVAL: Record<BillingUnit, number> = {
  day: 1000,
  week: 200,
  month: 240,
  year: 100,
};

const MAX_NAME_LENGTH = 80;

export interface FormValidationResult {
  errors: FormErrors;
  draft?: SubscriptionDraft;
}

export function validateSubscriptionForm(values: SubscriptionFormValues): FormValidationResult {
  const errors: FormErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = "Name is required";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Keep it under ${MAX_NAME_LENGTH} characters`;
  }

  let priceMinor = 0;
  const price = values.price.trim();
  if (!price) {
    errors.price = "Price is required";
  } else {
    const parsed = parseAmountToMinor(price, values.currency);
    if (parsed === null) {
      errors.price = "Enter a valid price";
    } else if (parsed === 0) {
      errors.price = "Price must be greater than 0";
    } else if (parsed > MAX_PRICE_MINOR) {
      errors.price = "Price is too large";
    } else {
      priceMinor = parsed;
    }
  }

  let billingInterval = 1;
  let billingUnit: BillingUnit = "month";
  if (values.cycle === "custom") {
    const rawInterval = values.customInterval.trim();
    if (!rawInterval) {
      errors.customInterval = "Interval is required";
    } else if (!/^\d+$/.test(rawInterval)) {
      errors.customInterval = "Enter a whole number";
    } else {
      const n = parseInt(rawInterval, 10);
      const max = MAX_INTERVAL[values.customUnit];
      if (n < 1) {
        errors.customInterval = "Must be at least 1";
      } else if (n > max) {
        errors.customInterval = `Maximum is ${max}`;
      } else {
        billingInterval = n;
        billingUnit = values.customUnit;
      }
    }
  } else {
    const preset = PRESET_INTERVAL[values.cycle];
    billingInterval = preset.interval;
    billingUnit = preset.unit;
  }

  let nextBillingDate: string | undefined;
  if (!values.nextBillingDate) {
    errors.nextBillingDate = "Next payment date is required";
  } else {
    const parsed = parseISO(values.nextBillingDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.nextBillingDate = "Invalid date";
    } else {
      nextBillingDate = formatISO(parsed, { representation: "date" });
    }
  }

  let startDate: string | null = null;
  if (values.startDate) {
    const parsed = parseISO(values.startDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.startDate = "Invalid date";
    } else {
      startDate = formatISO(parsed, { representation: "date" });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    draft: {
      name,
      priceMinor,
      currency: values.currency,
      billingInterval,
      billingUnit,
      startDate,
      nextBillingDate: nextBillingDate!,
      categoryId: values.categoryId || null,
      notes: values.notes.trim() || null,
      status: values.status,
      reminderDaysBefore: values.reminderDaysBefore,
    },
  };
}

export function toFormValues(subscription: {
  name: string;
  priceMinor: number;
  currency: string;
  billingInterval: number;
  billingUnit: BillingUnit;
  startDate?: string | null;
  nextBillingDate: string;
  categoryId?: string | null;
  notes?: string | null;
  status: SubscriptionStatus;
  reminderDaysBefore?: number | null;
}): SubscriptionFormValues {
  return {
    name: subscription.name,
    price: toPriceString(subscription.priceMinor, subscription.currency),
    currency: subscription.currency,
    cycle: presetFromBilling(subscription.billingInterval, subscription.billingUnit),
    customInterval:
      presetFromBilling(subscription.billingInterval, subscription.billingUnit) === "custom"
        ? String(subscription.billingInterval)
        : "",
    customUnit:
      presetFromBilling(subscription.billingInterval, subscription.billingUnit) === "custom"
        ? subscription.billingUnit
        : "month",
    nextBillingDate: subscription.nextBillingDate,
    categoryId: subscription.categoryId ?? null,
    startDate: subscription.startDate ?? null,
    reminderDaysBefore: subscription.reminderDaysBefore ?? null,
    notes: subscription.notes ?? "",
    status: subscription.status,
  };
}

function toPriceString(priceMinor: number, currency: string): string {
  const info = getCurrencyInfo(currency);
  if (info.minorUnits === 0) return String(priceMinor);
  const whole = Math.floor(priceMinor / 100);
  const frac = priceMinor % 100;
  return frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
}
