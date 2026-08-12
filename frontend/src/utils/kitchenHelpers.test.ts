import { describe, expect, it } from "vitest";

import { getTimeBadgeColor } from "@/utils/kitchenHelpers";

describe("kitchen helpers", () => {
  it.each([
    [5, "bg-emerald-100"],
    [10, "bg-amber-100"],
    [15, "bg-orange-100"],
    [16, "bg-red-100"],
  ])("assigns the expected time badge at %i minutes", (minutes, className) => {
    expect(getTimeBadgeColor(minutes)).toContain(className);
  });
});
