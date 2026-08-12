export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  minorUnits: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$", minorUnits: 2 },
  { code: "EUR", name: "Euro", symbol: "€", minorUnits: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", minorUnits: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", minorUnits: 0 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", minorUnits: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", minorUnits: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", minorUnits: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "CN¥", minorUnits: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", minorUnits: 0 },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", minorUnits: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", minorUnits: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", minorUnits: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", minorUnits: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", minorUnits: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", minorUnits: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", minorUnits: 2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", minorUnits: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", minorUnits: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", minorUnits: 2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", minorUnits: 2 },
];

const byCode = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrencyInfo(code: string): CurrencyInfo {
  return byCode.get(code) ?? { code, name: code, symbol: code, minorUnits: 2 };
}

export function minorToMajor(minor: number, currency: string): number {
  const info = getCurrencyInfo(currency);
  return minor / 10 ** info.minorUnits;
}

export function majorToMinor(major: number, currency: string): number {
  const info = getCurrencyInfo(currency);
  return Math.round(major * 10 ** info.minorUnits);
}

/** Formats a major-unit amount for text input (no currency symbol/separators). */
export function formatMajor(major: number, currency: string): string {
  const info = getCurrencyInfo(currency);
  if (info.minorUnits === 0) return String(Math.round(major));
  return major.toFixed(2);
}

/**
 * Parses a user-typed amount into integer minor units.
 * Accepts "12.99", "12,99" (comma thousands separator), "0.5", leading symbols.
 * Returns null when the input is not a valid non-negative amount for the
 * currency's minor-unit precision.
 */
export function parseAmountToMinor(raw: string, currency: string): number | null {
  const info = getCurrencyInfo(currency);
  const cleaned = raw
    .trim()
    .replace(/[^\d.,]/g, "")
    .replace(/,/g, "");
  if (cleaned === "") return null;

  if (info.minorUnits === 0) {
    if (!/^\d+$/.test(cleaned)) return null;
    return parseInt(cleaned, 10);
  }

  const match = cleaned.match(/^(\d*)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  const whole = parseInt(match[1] || "0", 10);
  const frac = parseInt((match[2] || "").padEnd(2, "0") || "0", 10);
  return whole * 100 + frac;
}

const MAX_PRICE_MINOR = 100_000_000; // 1,000,000 major units at 2 decimals
export { MAX_PRICE_MINOR };
