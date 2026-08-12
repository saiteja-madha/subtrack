import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  endOfMonth,
  getDaysInMonth,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  setDate,
  startOfDay,
} from "date-fns";

import { minorToMajor } from "@/constants/currencies";
import type { BillingUnit, Subscription } from "@/domain/types";

export interface UpcomingRenewal {
  subscription: Subscription;
  date: Date;
}

/**
 * Number of billing periods that fit in one year for a unit.
 * day = 365, week = 52, month = 12, year = 1.
 */
export function periodsPerYear(unit: BillingUnit): number {
  switch (unit) {
    case "day":
      return 365;
    case "week":
      return 52;
    case "month":
      return 12;
    case "year":
      return 1;
  }
}

/**
 * Adds a billing interval to a date, preserving the day-of-month anchor.
 * When a month lacks the anchor day (e.g. 31st in February) the result is
 * clamped to the last day of that month.
 */
export function addBillingInterval(date: Date, interval: number, unit: BillingUnit): Date {
  switch (unit) {
    case "day":
      return addDays(date, interval);
    case "week":
      return addWeeks(date, interval);
    case "month":
      return addMonthsPreservingDay(date, interval);
    case "year":
      return addMonthsPreservingDay(date, interval * 12);
  }
}

function addMonthsPreservingDay(date: Date, months: number): Date {
  const anchorDay = date.getDate();
  const target = addMonths(date, months);
  const daysInTarget = getDaysInMonth(target);
  return setDate(target, Math.min(anchorDay, daysInTarget));
}

/**
 * Computes the effective next billing date for a subscription.
 *
 * If the stored next billing date is today or in the future, it is returned.
 * If it is overdue, it is advanced by whole billing periods until it lands on
 * or after the given reference date. Stored data is never mutated.
 */
export function computeNextBillingDate(
  nextBillingDateISO: string,
  interval: number,
  unit: BillingUnit,
  from: Date = new Date(),
): Date {
  const fromDay = startOfDay(from);
  let date = startOfDay(parseISO(nextBillingDateISO));

  if (!isBefore(date, fromDay)) return date;

  if (unit === "day" || unit === "week") {
    const unitDays = unit === "day" ? 1 : 7;
    const overdueDays = differenceInDays(fromDay, date);
    const steps = Math.max(1, Math.ceil(overdueDays / (interval * unitDays)));
    return addBillingInterval(date, interval * steps, unit);
  }

  // month / year — jump ahead in whole periods to stay efficient.
  const monthsPerPeriod = unit === "month" ? interval : interval * 12;
  const overdueMonths = differenceInMonths(fromDay, date);
  if (overdueMonths > 0) {
    const steps = Math.floor(overdueMonths / monthsPerPeriod);
    if (steps > 0) {
      date = addMonthsPreservingDay(date, monthsPerPeriod * steps);
    }
  }

  let guard = 0;
  while (isBefore(date, fromDay) && guard < 10000) {
    date = addMonthsPreservingDay(date, monthsPerPeriod);
    guard += 1;
  }
  return date;
}

export function getNextBillingDate(subscription: Subscription, from: Date = new Date()): Date {
  return computeNextBillingDate(
    subscription.nextBillingDate,
    subscription.billingInterval,
    subscription.billingUnit,
    from,
  );
}

/** Monthly equivalent cost in major units (float, for display only). */
export function getMonthlyEquivalent(subscription: Subscription): number {
  const priceMajor = minorToMajor(subscription.priceMinor, subscription.currency);
  const periods = periodsPerYear(subscription.billingUnit);
  return (priceMajor * periods) / subscription.billingInterval / 12;
}

/** Yearly equivalent cost in major units (float, for display only). */
export function getYearlyEquivalent(subscription: Subscription): number {
  return getMonthlyEquivalent(subscription) * 12;
}

export interface UpcomingQuery {
  from?: Date;
  /** Inclusive upper bound (end of day). */
  until?: Date;
}

/**
 * Returns upcoming renewals for active subscriptions, sorted by date.
 * The effective renewal date is derived (overdue dates are advanced).
 */
export function getUpcomingRenewals(
  subscriptions: Subscription[],
  query: UpcomingQuery = {},
): UpcomingRenewal[] {
  const from = startOfDay(query.from ?? new Date());
  const until = query.until ? endOfDayFor(query.until) : undefined;
  const result: UpcomingRenewal[] = [];

  for (const subscription of subscriptions) {
    if (subscription.status !== "active") continue;
    const date = getNextBillingDate(subscription, from);
    if (isBefore(date, from)) continue;
    if (until && isBefore(until, date)) continue;
    result.push({ subscription, date });
  }

  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

export type UpcomingGroupKey = "today" | "tomorrow" | "week" | "month" | "later";

export const UPCOMING_GROUP_LABELS: Record<UpcomingGroupKey, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  week: "This week",
  month: "This month",
  later: "Later",
};

export type UpcomingGroups = Record<UpcomingGroupKey, UpcomingRenewal[]>;

/**
 * Groups upcoming renewals into Today / Tomorrow / This week / This month / Later.
 * Only active subscriptions appear.
 */
export function groupUpcomingRenewals(
  subscriptions: Subscription[],
  from: Date = new Date(),
): UpcomingGroups {
  const fromStart = startOfDay(from);
  const renewals = getUpcomingRenewals(subscriptions, { from });
  const groups: UpcomingGroups = {
    today: [],
    tomorrow: [],
    week: [],
    month: [],
    later: [],
  };

  for (const renewal of renewals) {
    const day = renewal.date;
    if (isSameDay(day, fromStart)) {
      groups.today.push(renewal);
    } else if (isSameDay(day, addDays(fromStart, 1))) {
      groups.tomorrow.push(renewal);
    } else if (day.getTime() <= addDays(fromStart, 7).getTime()) {
      groups.week.push(renewal);
    } else if (isSameMonth(day, fromStart)) {
      groups.month.push(renewal);
    } else {
      groups.later.push(renewal);
    }
  }
  return groups;
}

function endOfDayFor(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export { endOfMonth };

/** Human readable billing cycle, e.g. "Monthly", "Every 3 months", "Every 14 days". */
export function billingCycleLabel(interval: number, unit: BillingUnit): string {
  if (interval === 1) {
    switch (unit) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      case "year":
        return "Yearly";
    }
  }
  const noun = unit === "day" ? "days" : `${unit}s`;
  return `Every ${interval} ${noun}`;
}
