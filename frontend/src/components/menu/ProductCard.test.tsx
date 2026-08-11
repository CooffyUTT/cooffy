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

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastWarningMock = vi.fn();
const toastInfoMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
    warning: (...args: unknown[]) => toastWarningMock(...args),
    info: (...args: unknown[]) => toastInfoMock(...args),
  },
}));

import { CartProvider, useCart } from "@/context/CartContext";
import ProductCard from "@/components/menu/ProductCard";
import type { ProductList } from "@/types/product";

const productA: ProductList = {
  id: 10,
  name: "Café Americano",
  price: 50,
  image: null,
  category: { id: 1, name: "Bebidas" },
  branchId: 1,
};
const productB: ProductList = {
  id: 11,
  name: "Té Chai",
  price: 40,
  image: null,
  category: { id: 1, name: "Bebidas" },
  branchId: 2,
};
const productOutOfStockInBranch1: ProductList = {
  id: 12,
  name: "Matcha Latte",
  price: 60,
  image: null,
  category: { id: 1, name: "Bebidas" },
  branchId: 2,
  availableInBranches: [2],
};

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
  toastErrorMock.mockReset();
  toastSuccessMock.mockReset();
  toastWarningMock.mockReset();
  toastInfoMock.mockReset();
});

function seedCartWithBranch(branchId: number, branchName: string) {
  localStorage.setItem(
    "cooffy_cart",
    JSON.stringify([
      { id: 1, name: "Seed", price: 1, quantity: 1, branchId },
    ]),
  );
  localStorage.setItem("cooffy_branch_id", JSON.stringify(branchId));
  localStorage.setItem("cooffy_branch_name", branchName);
}

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

  it("opens the switch-branch dialog when the cart is for a different branch and the product has no per-branch availability info", async () => {
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
      image: null,
      category: { id: 1, name: "Combos" },
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
      expect(toastErrorMock).toHaveBeenCalledWith("Producto no disponible en esta sucursal");
    });
    expect(JSON.parse(localStorage.getItem("cooffy_cart") ?? "[]")).toHaveLength(0);
  });
});

describe("ProductCard out-of-stock availability (RF-06 / RN-08)", () => {
  it("shows the AGOTADO badge when the selected branch is not in availableInBranches", () => {
    seedCartWithBranch(1, "Sucursal Centro");

    render(
      <Wrapper>
        <ProductCard product={productOutOfStockInBranch1} />
      </Wrapper>
    );

    expect(screen.getByTestId("out-of-stock-badge")).toHaveTextContent(/Agotado/i);
  });

  it("renders a disabled add button labeled 'Agotado' when the product is out of stock in the selected branch", () => {
    seedCartWithBranch(1, "Sucursal Centro");

    render(
      <Wrapper>
        <ProductCard product={productOutOfStockInBranch1} />
      </Wrapper>
    );

    const button = screen.getByRole("button", { name: /Matcha Latte está agotado/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/Agotado/i);
  });

  it("does not modify the cart when the disabled add button is clicked", () => {
    seedCartWithBranch(1, "Sucursal Centro");

    function ReadCart() {
      const { cart } = useCart();
      return <span data-testid="cart-count">{cart.length}</span>;
    }

    const user = userEvent.setup();
    render(
      <Wrapper>
        <ReadCart />
        <ProductCard product={productOutOfStockInBranch1} />
      </Wrapper>
    );

    const button = screen.getByRole("button", { name: /Matcha Latte está agotado/i });
    expect(button).toBeDisabled();

    void user.click(button);

    expect(screen.getByTestId("cart-count").textContent).toBe("1");
  });

  it("does not show the AGOTADO badge when no branch is selected (global catalog mode)", () => {
    render(
      <Wrapper>
        <ProductCard product={productOutOfStockInBranch1} />
      </Wrapper>
    );

    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Agregar Matcha Latte al carrito/i })
    ).toBeInTheDocument();
  });

  it("does not show the AGOTADO badge when the selected branch is in availableInBranches", () => {
    seedCartWithBranch(2, "Sucursal Norte");

    render(
      <Wrapper>
        <ProductCard product={productOutOfStockInBranch1} />
      </Wrapper>
    );

    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Agregar Matcha Latte al carrito/i })
    ).toBeInTheDocument();
  });
});
