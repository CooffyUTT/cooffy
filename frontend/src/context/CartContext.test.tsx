import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { CartProvider, useCart, type CartProduct } from "@/context/CartContext";

const product: CartProduct = {
  id: 1,
  name: "Café",
  price: 50,
};

function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

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
