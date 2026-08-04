import type { AnalyticsPeriod } from "@/types/analytics";

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

const HOUR_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  hour12: false,
});

export function formatCurrency(value: string | number): string {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(numeric)) return CURRENCY_FORMATTER.format(0);
  return CURRENCY_FORMATTER.format(numeric);
}

export function formatCurrencyCompact(value: string | number): string {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(numeric)) return COMPACT_CURRENCY_FORMATTER.format(0);
  return COMPACT_CURRENCY_FORMATTER.format(numeric);
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} min`;
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("es-MX");
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return SHORT_DATE_FORMATTER.format(date);
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return FULL_DATE_FORMATTER.format(date);
}

export function formatHour(hour: number): string {
  if (hour < 0 || hour > 23) return "—";
  return HOUR_FORMATTER.format(new Date(2000, 0, 1, hour, 0));
}

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  daily: "Hoy",
  weekly: "Semanal",
  monthly: "Mensual",
  four_monthly: "Cuatrimestral",
  semesterly: "Semestral",
};

export const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  daily: 0,
  weekly: 7,
  monthly: 30,
  four_monthly: 120,
  semesterly: 180,
};

export function periodToRangeLabel(period: AnalyticsPeriod): string {
  const today = new Date();
  const days = PERIOD_DAYS[period];
  if (days === 0) {
    return `Hoy · ${SHORT_DATE_FORMATTER.format(today)}`;
  }
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  return `${SHORT_DATE_FORMATTER.format(start)} – ${SHORT_DATE_FORMATTER.format(today)}`;
}

export { TIME_FORMATTER };
