import { describe, expect, it } from "vitest";

import {
  bucketOperationTimes,
  getOperationTimeBucket,
} from "@/utils/analyticsBuckets";
import type { OperationTimePoint } from "@/types/analytics";

describe("getOperationTimeBucket", () => {
  it("uses day buckets for short periods", () => {
    expect(getOperationTimeBucket("daily")).toBe("day");
    expect(getOperationTimeBucket("weekly")).toBe("day");
    expect(getOperationTimeBucket("monthly")).toBe("day");
  });

  it("uses week buckets for four_monthly", () => {
    expect(getOperationTimeBucket("four_monthly")).toBe("week");
  });

  it("uses month buckets for semesterly", () => {
    expect(getOperationTimeBucket("semesterly")).toBe("month");
  });
});

describe("bucketOperationTimes", () => {
  it("is a no-op for empty input", () => {
    expect(bucketOperationTimes([], "day")).toEqual([]);
  });

  it("keeps each point on its own bucket when bucketing by day", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-01", avg_minutes: 8, min_minutes: 5, max_minutes: 12 },
      { date: "2026-08-02", avg_minutes: 10, min_minutes: 6, max_minutes: 14 },
    ];
    const result = bucketOperationTimes(data, "day");

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: "2026-08-01",
      bucket: "day",
      avg_minutes: 8,
      min_minutes: 5,
      max_minutes: 12,
    });
  });

  it("aggregates by week using Monday as the start of the week", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-03", avg_minutes: 8, min_minutes: 5, max_minutes: 12 },
      { date: "2026-08-04", avg_minutes: 12, min_minutes: 7, max_minutes: 18 },
      { date: "2026-08-05", avg_minutes: 10, min_minutes: 6, max_minutes: 14 },
    ];
    const result = bucketOperationTimes(data, "week");

    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.bucket).toBe("week");
    expect(entry.avg_minutes).toBe(10);
    expect(entry.min_minutes).toBe(5);
    expect(entry.max_minutes).toBe(18);
    expect(entry.date).toBe("2026-08-03");
  });

  it("aggregates by calendar month", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-07-15", avg_minutes: 8, min_minutes: 5, max_minutes: 12 },
      { date: "2026-07-28", avg_minutes: 12, min_minutes: 7, max_minutes: 18 },
      { date: "2026-08-03", avg_minutes: 9, min_minutes: 6, max_minutes: 11 },
    ];
    const result = bucketOperationTimes(data, "month");

    expect(result.map((r) => r.date)).toEqual(["2026-07", "2026-08"]);
    expect(result[0].avg_minutes).toBe(10);
    expect(result[0].min_minutes).toBe(5);
    expect(result[0].max_minutes).toBe(18);
    expect(result[1].avg_minutes).toBe(9);
  });

  it("handles null values in min/max gracefully", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-01", avg_minutes: 8, min_minutes: null, max_minutes: 12 },
      { date: "2026-08-02", avg_minutes: 10, min_minutes: 6, max_minutes: null },
    ];
    const result = bucketOperationTimes(data, "week");

    expect(result).toHaveLength(1);
    expect(result[0].min_minutes).toBe(6);
    expect(result[0].max_minutes).toBe(12);
    expect(result[0].avg_minutes).toBe(9);
  });

  it("returns null when no group has any usable value", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-01", avg_minutes: null, min_minutes: null, max_minutes: null },
    ];
    const result = bucketOperationTimes(data, "day");

    expect(result[0].avg_minutes).toBeNull();
    expect(result[0].min_minutes).toBeNull();
    expect(result[0].max_minutes).toBeNull();
  });

  it("preserves chronological order across buckets", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-15", avg_minutes: 8, min_minutes: 5, max_minutes: 12 },
      { date: "2026-06-15", avg_minutes: 10, min_minutes: 6, max_minutes: 14 },
      { date: "2026-07-15", avg_minutes: 9, min_minutes: 6, max_minutes: 13 },
    ];
    const result = bucketOperationTimes(data, "month");

    expect(result.map((r) => r.date)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
    ]);
  });

  it("includes the bucket_label metadata for the chart", () => {
    const data: OperationTimePoint[] = [
      { date: "2026-08-15", avg_minutes: 8, min_minutes: 5, max_minutes: 12 },
    ];
    const result = bucketOperationTimes(data, "month");

    expect(result[0].bucket_label).toBe("2026-08");
  });
});
