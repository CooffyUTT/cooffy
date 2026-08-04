import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => getMock(...args),
  },
}));

import {
  getDailySummary,
  getOperationTimes,
  getOrdersByHour,
  getSales,
  getTopProducts,
} from "@/services/analyticsService";

describe("analyticsService", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("builds the daily-summary URL with the period", async () => {
    getMock.mockResolvedValue({ data: { period: "daily" } });
    await getDailySummary("monthly");
    expect(getMock).toHaveBeenCalledWith(
      "/api/analytics/daily-summary/?period=monthly",
    );
  });

  it("builds the top-products URL with the period", async () => {
    getMock.mockResolvedValue({ data: { period: "weekly", products: [] } });
    await getTopProducts("weekly");
    expect(getMock).toHaveBeenCalledWith(
      "/api/analytics/top-products/?period=weekly",
    );
  });

  it("builds the orders-by-hour URL with the period", async () => {
    getMock.mockResolvedValue({ data: { period: "daily", hours: [] } });
    await getOrdersByHour("daily");
    expect(getMock).toHaveBeenCalledWith(
      "/api/analytics/orders-by-hour/?period=daily",
    );
  });

  it("builds the sales URL with the period", async () => {
    getMock.mockResolvedValue({ data: { period: "monthly", data: [] } });
    await getSales("monthly");
    expect(getMock).toHaveBeenCalledWith(
      "/api/analytics/sales/?period=monthly",
    );
  });

  it("builds the operation-times URL with the period", async () => {
    getMock.mockResolvedValue({ data: { period: "semesterly" } });
    await getOperationTimes("semesterly");
    expect(getMock).toHaveBeenCalledWith(
      "/api/analytics/operation-times/?period=semesterly",
    );
  });

  it("returns the response payload directly", async () => {
    const payload = {
      sales_total: "100.00",
      orders_count: 4,
      top_product: null,
      avg_operation_minutes: null,
      period: "daily" as const,
      date: "2026-08-04",
    };
    getMock.mockResolvedValue({ data: payload });
    await expect(getDailySummary("daily")).resolves.toEqual(payload);
  });
});
