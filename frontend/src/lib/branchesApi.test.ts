import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

import { toggleAcceptingOrders } from "@/lib/branchesApi";

describe("branchesApi.toggleAcceptingOrders", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("POSTs to /api/branches/{id}/toggle-accepting/ and returns the payload", async () => {
    postMock.mockResolvedValue({
      data: { id: 7, name: "Sucursal Centro", accepting_orders: false },
    });

    const branch = await toggleAcceptingOrders(7);

    expect(postMock).toHaveBeenCalledWith(
      "/api/branches/7/toggle-accepting/",
    );
    expect(branch).toEqual({
      id: 7,
      name: "Sucursal Centro",
      accepting_orders: false,
    });
  });

  it("propagates axios errors so the caller can show an error toast", async () => {
    const apiError = {
      response: { status: 500, data: { detail: "Server error" } },
    };
    postMock.mockRejectedValue(apiError);

    await expect(toggleAcceptingOrders(1)).rejects.toEqual(apiError);
  });
});
