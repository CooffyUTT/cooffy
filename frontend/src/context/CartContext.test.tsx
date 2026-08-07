import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { CartProvider, useCart, type CartProduct } from "@/context/CartContext";

const product: CartProduct = {
  id: 1,
  name: "Café",
  price: 50,
  branchId: 1,
  availableInBranches: [1],
};

const productFromOtherBranch: CartProduct = {
  id: 2,
  name: "Té",
  price: 40,
  branchId: 2,
  availableInBranches: [2],
};

const productWithoutBranch: CartProduct = {
  id: 3,
  name: "Sin sucursal",
  price: 30,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds the same product by increasing its quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.addToCart(product);
    });

    expect(result.current.cart).toEqual([{ ...product, quantity: 2 }]);
    expect(result.current.totalItems).toBe(2);
  });

  it("removes an item when its quantity reaches zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
      result.current.updateQuantity(product.id, -1);
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it("extracts included tax without changing the total", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(product);
    });

    expect(result.current.subtotal).toBe(50);
    expect(result.current.tax).toBeCloseTo(3.7037, 4);
    expect(result.current.total).toBe(50);
  });
});

describe("CartContext.tryAddToCart", () => {
  it("locks the cart's branch to the first product and adds it", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    let outcome: ReturnType<typeof result.current.tryAddToCart> | undefined;
    act(() => {
      outcome = result.current.tryAddToCart(product, "Sucursal Centro");
    });

    expect(outcome).toEqual({ ok: true });
    expect(result.current.branchId).toBe(1);
    expect(result.current.branchName).toBe("Sucursal Centro");
    expect(result.current.cart).toHaveLength(1);
  });

  it("returns different_branch without mutating the cart on a conflict", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.tryAddToCart(product, "Sucursal Centro");
    });

    let outcome: ReturnType<typeof result.current.tryAddToCart> | undefined;
    act(() => {
      outcome = result.current.tryAddToCart(productFromOtherBranch, "Sucursal Norte");
    });

    expect(outcome).toEqual({
      ok: false,
      reason: "different_branch",
      productBranchId: 2,
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.branchId).toBe(1);
  });

  it("adds a matching product to a non-empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.tryAddToCart(product, "Sucursal Centro");
    });

    let outcome: ReturnType<typeof result.current.tryAddToCart> | undefined;
    act(() => {
      outcome = result.current.tryAddToCart(
        { ...product, id: 99, name: "Café doble" },
        "Sucursal Centro"
      );
    });

    expect(outcome).toEqual({ ok: true });
    expect(result.current.cart).toHaveLength(2);
  });

  it("returns unavailable when the product has no branch assigned", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    let outcome: ReturnType<typeof result.current.tryAddToCart> | undefined;
    act(() => {
      outcome = result.current.tryAddToCart(productWithoutBranch);
    });

    expect(outcome).toEqual({ ok: false, reason: "unavailable" });
    expect(result.current.cart).toEqual([]);
  });

  it("canAddToCart blocks products from a different branch when the cart has items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.tryAddToCart(product, "Sucursal Centro");
    });

    expect(result.current.canAddToCart(product.branchId)).toBe(true);
    expect(result.current.canAddToCart(productFromOtherBranch.branchId)).toBe(false);
    expect(result.current.canAddToCart(undefined)).toBe(false);
  });
});
