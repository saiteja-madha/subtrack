import { getCurrencyInfo, minorToMajor } from "@/constants/currencies";

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      });
    } catch {
      formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      });
    }
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

/** Format an amount expressed in major units (e.g. 22.99) for a currency. */
export function formatCurrency(amount: number, currency: string): string {
  return getFormatter(currency).format(amount);
}

/** Format a stored integer minor-unit amount for a currency. */
export function formatPriceMinor(minor: number, currency: string): string {
  return getFormatter(currency).format(minorToMajor(minor, currency));
}

/** Format an amount in minor units with a symbol for compact contexts. */
export function currencySymbol(currency: string): string {
  return getCurrencyInfo(currency).symbol;
}
