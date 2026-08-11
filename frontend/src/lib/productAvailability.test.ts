import { describe, expect, it } from "vitest";
import { isOutOfStockInBranch } from "@/lib/productAvailability";

describe("isOutOfStockInBranch (RF-06 / RN-08)", () => {
  it("returns false when no branch is selected (global catalog mode)", () => {
    expect(isOutOfStockInBranch({ availableInBranches: [] }, null)).toBe(false);
    expect(isOutOfStockInBranch({ availableInBranches: [2] }, null)).toBe(false);
  });

  it("returns false when the selected branch is included in availableInBranches", () => {
    expect(isOutOfStockInBranch({ availableInBranches: [1, 2] }, 1)).toBe(false);
  });

  it("returns true when the selected branch is missing from availableInBranches", () => {
    expect(isOutOfStockInBranch({ availableInBranches: [2] }, 1)).toBe(true);
    expect(isOutOfStockInBranch({ availableInBranches: [] }, 1)).toBe(true);
  });

  it("returns false when availableInBranches is undefined (backend did not expose it)", () => {
    expect(isOutOfStockInBranch({}, 1)).toBe(false);
  });
});
