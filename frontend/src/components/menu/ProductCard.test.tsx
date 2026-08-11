import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => ({
    data: [
      { id: 1, name: "Sucursal Centro", location: null, schedule: null, company_name: "Co", accepting_orders: true },
      { id: 2, name: "Sucursal Norte", location: null, schedule: null, company_name: "Co", accepting_orders: true },
    ],
    isLoading: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from "sonner";
import { CartProvider, useCart } from "@/context/CartContext";
import ProductCard from "@/components/menu/ProductCard";

const productA = {
  id: 10,
  name: "Café Americano",
  price: 50,
  branchId: 1,
};
const productB = {
  id: 11,
  name: "Té Chai",
  price: 40,
  branchId: 2,
};

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.success).mockReset();
});

describe("ProductCard cross-branch flow", () => {
  it("adds a product directly when the cart is empty", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <ProductCard product={productA} />
      </Wrapper>
    );

    await user.click(screen.getByRole("button", { name: /Agregar Café Americano al carrito/i }));

    await waitFor(() => {
      expect(screen.getByText(/Agregado/i)).toBeInTheDocument();
    });
  });

  it("opens the switch-branch dialog when the cart is for a different branch", async () => {
    const user = userEvent.setup();
    function Seed() {
      const { tryAddToCart } = useCart();
      return (
        <button
          data-testid="seed"
          onClick={() => tryAddToCart(productA, "Sucursal Centro")}
        >
          seed
        </button>
      );
    }

    render(
      <Wrapper>
        <Seed />
        <ProductCard product={productB} />
      </Wrapper>
    );

    await user.click(screen.getByTestId("seed"));
    await user.click(screen.getByRole("button", { name: /Té Chai es de otra sucursal/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Este producto es de otra sucursal/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Sucursal Norte/i).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/Sucursal Centro/i).length).toBeGreaterThan(0);
  });

  it("switches the cart's branch and clears it when the user confirms", async () => {
    const user = userEvent.setup();
    function Seed() {
      const { tryAddToCart } = useCart();
      return (
        <button
          data-testid="seed"
          onClick={() => tryAddToCart(productA, "Sucursal Centro")}
        >
          seed
        </button>
      );
    }
    function ReadCart() {
      const { cart, branchId, branchName } = useCart();
      return (
        <span data-testid="cart-state">
          {cart.length}:{branchId ?? "null"}:{branchName ?? "null"}
        </span>
      );
    }

    render(
      <Wrapper>
        <Seed />
        <ReadCart />
        <ProductCard product={productB} />
      </Wrapper>
    );

    await user.click(screen.getByTestId("seed"));
    await user.click(screen.getByRole("button", { name: /Té Chai es de otra sucursal/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Cambiar a «Sucursal Norte» y vaciar carrito/i }));

    await waitFor(() => {
      const state = screen.getByTestId("cart-state").textContent ?? "";
      expect(state).toBe("1:2:Sucursal Norte");
    });
  });

  it("shows a toast when a product is not assigned to any branch", async () => {
    const user = userEvent.setup();
    const orphanProduct = {
      id: 99,
      name: "Combo especial",
      price: 60,
    };

    render(
      <Wrapper>
        <ProductCard product={orphanProduct} />
      </Wrapper>,
    );

    const addButton = screen.getByRole("button", { name: /Agregar Combo especial al carrito/i });
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Producto no disponible en esta sucursal");
    });
    expect(JSON.parse(localStorage.getItem("cooffy_cart") ?? "[]")).toHaveLength(0);
  });
});
