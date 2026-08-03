import { describe, expect, it } from "vitest";

import { formatCurrency } from "@/utils/formatters";

describe("formatCurrency", () => {
  it("formats amounts as whole Mexican pesos", () => {
    const formatted = formatCurrency(1234.56);

    expect(formatted).toContain("1,235");
    expect(formatted).toContain("$");
  });
});
