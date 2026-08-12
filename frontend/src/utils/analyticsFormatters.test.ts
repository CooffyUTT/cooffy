import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatCurrencyCompact,
  formatFullDate,
  formatHour,
  formatInteger,
  formatMinutes,
  formatShortDate,
  PERIOD_LABELS,
  periodToRangeLabel,
} from "@/utils/analyticsFormatters";

describe("formatCurrency", () => {
  it("renders MXN currency with two decimals", () => {
    expect(formatCurrency(1250)).toContain("1,250.00");
    expect(formatCurrency("4580.50")).toContain("4,580.50");
  });

  it("falls back to zero on invalid input", () => {
    expect(formatCurrency("not-a-number")).toContain("0.00");
  });
});

describe("formatCurrencyCompact", () => {
  it("renders a compact representation for large numbers", () => {
    const formatted = formatCurrencyCompact(15000);
    expect(formatted).toMatch(/15([.,]\d+)?\s?[kK]/);
  });
});

describe("formatMinutes", () => {
  it("formats one decimal place with the 'min' suffix", () => {
    expect(formatMinutes(8.34)).toBe("8.3 min");
  });

  it("renders an em-dash for nullish or NaN values", () => {
    expect(formatMinutes(null)).toBe("—");
    expect(formatMinutes(undefined)).toBe("—");
    expect(formatMinutes(Number.NaN)).toBe("—");
  });
});

describe("formatInteger", () => {
  it("formats with thousands separators in es-MX locale", () => {
    expect(formatInteger(1234)).toBe("1,234");
  });

  it("returns an em-dash for nullish values", () => {
    expect(formatInteger(null)).toBe("—");
    expect(formatInteger(undefined)).toBe("—");
  });
});

describe("formatShortDate", () => {
  it("returns the short Spanish month label", () => {
    expect(formatShortDate("2026-08-04")).toMatch(/04/);
    expect(formatShortDate("2026-08-04")).toMatch(/ago/);
  });
});

describe("formatFullDate", () => {
  it("returns the long Spanish month and year", () => {
    expect(formatFullDate("2026-08-04")).toMatch(/agosto/);
    expect(formatFullDate("2026-08-04")).toMatch(/2026/);
  });
});

describe("formatHour", () => {
  it("formats hours in 24-hour format", () => {
    expect(formatHour(0)).toBe("00:00");
    expect(formatHour(13)).toBe("13:00");
    expect(formatHour(23)).toBe("23:00");
  });

  it("returns an em-dash for out-of-range hours", () => {
    expect(formatHour(-1)).toBe("—");
    expect(formatHour(24)).toBe("—");
  });
});

describe("PERIOD_LABELS", () => {
  it("exposes a label for every analytics period", () => {
    expect(PERIOD_LABELS.daily).toBe("Hoy");
    expect(PERIOD_LABELS.weekly).toBe("Semanal");
    expect(PERIOD_LABELS.monthly).toBe("Mensual");
    expect(PERIOD_LABELS.four_monthly).toBe("Cuatrimestral");
    expect(PERIOD_LABELS.semesterly).toBe("Semestral");
  });
});

describe("periodToRangeLabel", () => {
  it("labels daily as 'today'", () => {
    const label = periodToRangeLabel("daily");
    expect(label.toLowerCase()).toContain("hoy");
  });

  it("labels non-daily periods with a date range", () => {
    const label = periodToRangeLabel("monthly");
    expect(label).toMatch(/\d{2}/);
  });
});
