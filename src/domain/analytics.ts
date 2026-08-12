import { addDays, startOfDay } from "date-fns";

import {
  getMonthlyEquivalent,
  getUpcomingRenewals,
  getYearlyEquivalent,
  type UpcomingRenewal,
} from "@/domain/billing";
import type { Subscription } from "@/domain/types";

export interface SpendSummary {
  totalsByCurrency: CurrencySpendTotal[];
  activeCount: number;
  dueInNext7Days: number;
  upcoming: UpcomingRenewal[];
}

export interface CurrencySpendTotal {
  currency: string;
  monthly: number;
  yearly: number;
}

/**
 * Aggregated dashboard figures. Only active subscriptions contribute to
 * spending totals. Renewal counts use derived (effective) billing dates.
 */
export function getSpendSummary(
  subscriptions: Subscription[],
  from: Date = new Date(),
): SpendSummary {
  const active = subscriptions.filter((s) => s.status === "active");
  const fromStart = startOfDay(from);
  const in7Days = addDays(fromStart, 7);

  const totals = new Map<string, { monthly: number; yearly: number }>();
  for (const sub of active) {
    const total = totals.get(sub.currency) ?? { monthly: 0, yearly: 0 };
    total.monthly += getMonthlyEquivalent(sub);
    total.yearly += getYearlyEquivalent(sub);
    totals.set(sub.currency, total);
  }

  return {
    totalsByCurrency: [...totals.entries()]
      .map(([currency, total]) => ({ currency, ...total }))
      .sort((a, b) => a.currency.localeCompare(b.currency)),
    activeCount: active.length,
    dueInNext7Days: getUpcomingRenewals(subscriptions, {
      from,
      until: in7Days,
    }).length,
    upcoming: getUpcomingRenewals(subscriptions, {
      from,
      until: in7Days,
    }),
  };
}
