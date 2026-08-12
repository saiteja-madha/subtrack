import { describe, expect, it } from "vitest";
import { formatFullDate, formatShortDate } from "@/utils/dates";

describe("date-only formatting", () => {
  it("treats an ISO date as a local calendar date", () => {
    const localDate = new Date(2026, 7, 11);
    expect(formatShortDate("2026-08-11")).toBe(formatShortDate(localDate));
    expect(formatFullDate("2026-08-11")).toBe(formatFullDate(localDate));
  });
});
