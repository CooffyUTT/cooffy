import { describe, expect, it } from "vitest";

import { getServiceTypeBadge, getTimeBadgeColor } from "@/utils/kitchenHelpers";

describe("kitchen helpers", () => {
  it.each([
    [5, "bg-emerald-100"],
    [10, "bg-amber-100"],
    [15, "bg-orange-100"],
    [16, "bg-red-100"],
  ])("assigns the expected time badge at %i minutes", (minutes, className) => {
    expect(getTimeBadgeColor(minutes)).toContain(className);
  });

  it("returns the configured label and color for each service type", () => {
    expect(getServiceTypeBadge("takeaway")).toEqual(
      expect.objectContaining({ label: expect.stringContaining("Para llevar") })
    );
    expect(getServiceTypeBadge("dine_in")).toEqual(
      expect.objectContaining({ label: expect.stringContaining("Consumir aquí") })
    );
    expect(getServiceTypeBadge("preorder")).toEqual(
      expect.objectContaining({ label: expect.stringContaining("Pedido anticipado") })
    );
  });
});
