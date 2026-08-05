import type { AnalyticsPeriod, OperationTimePoint } from "@/types/analytics";

export type OperationTimeBucket = "day" | "week" | "month";

export function getOperationTimeBucket(
  period: AnalyticsPeriod,
): OperationTimeBucket {
  switch (period) {
    case "daily":
    case "weekly":
    case "monthly":
      return "day";
    case "four_monthly":
      return "week";
    case "semesterly":
      return "month";
  }
}

function bucketKey(dateStr: string, bucket: OperationTimeBucket): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  if (bucket === "day") {
    return dateStr;
  }

  if (bucket === "week") {
    const start = new Date(date);
    const day = start.getUTCDay();
    const diff = (day + 6) % 7;
    start.setUTCDate(start.getUTCDate() - diff);
    return start.toISOString().slice(0, 10);
  }

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function avgOf(values: Array<number | null>): number | null {
  const filtered = values.filter(
    (v): v is number => v !== null && !Number.isNaN(v),
  );
  if (!filtered.length) return null;
  return filtered.reduce((acc, v) => acc + v, 0) / filtered.length;
}

function minOf(values: Array<number | null>): number | null {
  const filtered = values.filter(
    (v): v is number => v !== null && !Number.isNaN(v),
  );
  if (!filtered.length) return null;
  return Math.min(...filtered);
}

function maxOf(values: Array<number | null>): number | null {
  const filtered = values.filter(
    (v): v is number => v !== null && !Number.isNaN(v),
  );
  if (!filtered.length) return null;
  return Math.max(...filtered);
}

export interface BucketedOperationTime extends OperationTimePoint {
  bucket: OperationTimeBucket;
}

export function bucketOperationTimes(
  data: OperationTimePoint[],
  bucket: OperationTimeBucket,
): BucketedOperationTime[] {
  const groups = new Map<string, OperationTimePoint[]>();

  for (const point of data) {
    const key = bucketKey(point.date, bucket);
    const existing = groups.get(key);
    if (existing) {
      existing.push(point);
    } else {
      groups.set(key, [point]);
    }
  }

  const entries = Array.from(groups.entries());
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return entries.map(([key, points]) => ({
    date: key,
    bucket,
    avg_minutes: roundMinutes(avgOf(points.map((p) => p.avg_minutes))),
    min_minutes: roundMinutes(minOf(points.map((p) => p.min_minutes))),
    max_minutes: roundMinutes(maxOf(points.map((p) => p.max_minutes))),
  }));
}

function roundMinutes(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}
