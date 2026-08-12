import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const patchMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
    patch: (...args: unknown[]) => patchMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
  },
}));

import {
  assignProductStock,
  listManageProducts,
  removeProductStock,
} from "@/lib/productsApi";

describe("productsApi stock endpoints (RF-06)", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("assignProductStock POSTs to /stocks/ with branch_id and stock", async () => {
    postMock.mockResolvedValue({
      data: {
        id: 3,
        name: "Café",
        price: "20.00",
        active: true,
        max_per_order: null,
        image: null,
        description: null,
        modifiers: [],
        branch_stocks: { "1": 0 },
        created_at: "2026-08-01",
        updated_at: "2026-08-01",
      },
    });

    const product = await assignProductStock(3, 1, 0);

    expect(postMock).toHaveBeenCalledWith("/api/menu/manage/products/3/stocks/", {
      branch_id: 1,
      stock: 0,
    });
    expect(product.branchStocks).toEqual({ 1: 0 });
  });

  it("assignProductStock omits stock when not provided", async () => {
    postMock.mockResolvedValue({
      data: { id: 3, name: "Café", price: "20.00", branch_stocks: { "1": -1 } },
    });

    await assignProductStock(3, 1);

    expect(postMock).toHaveBeenCalledWith("/api/menu/manage/products/3/stocks/", {
      branch_id: 1,
    });
  });

  it("removeProductStock DELETEs /stocks/ with branch_id as query param", async () => {
    deleteMock.mockResolvedValue({ status: 204 });

    await removeProductStock(3, 1);

    expect(deleteMock).toHaveBeenCalledWith(
      "/api/menu/manage/products/3/stocks/",
      { params: { branch_id: 1 } }
    );
  });

  it("listManageProducts normalizes string branch_stocks keys to numbers", async () => {
    getMock.mockResolvedValue({
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 3,
            name: "Café",
            price: "20.00",
            active: true,
            max_per_order: null,
            image: null,
            description: null,
            modifiers: [],
            branch_stocks: { "1": 1, "2": 0 },
            created_at: "2026-08-01",
            updated_at: "2026-08-01",
          },
        ],
      },
    });

    const { results } = await listManageProducts();

    expect(getMock).toHaveBeenCalledWith("/api/menu/manage/products/", {
      params: undefined,
    });
    expect(results[0].branchStocks).toEqual({ 1: 1, 2: 0 });
  });
});
