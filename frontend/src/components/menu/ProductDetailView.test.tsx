import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

const useProductMock = vi.fn();
const useProductsMock = vi.fn();

vi.mock("@/hooks/useProduct", () => ({
  useProduct: (id: number) => useProductMock(id),
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: (...args: unknown[]) => useProductsMock(...args),
}));

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { CartProvider } from "@/context/CartContext";
import { ProductDetailView } from "@/components/menu/ProductDetailView";
import type { ProductDetail } from "@/types/product";

const baseProduct: ProductDetail = {
  id: 12,
  name: "Matcha Latte",
  price: 60,
  image: null,
  description: "Té matcha con leche",
  modifiers: null,
  category: { id: 1, name: "Bebidas" },
};

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

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

beforeEach(() => {
  localStorage.clear();
  useProductMock.mockReset();
  useProductsMock.mockReset();
  useProductsMock.mockReturnValue({
    data: { count: 0, next: null, results: [] },
    isLoading: false,
    error: null,
  });
  toastErrorMock.mockReset();
  toastSuccessMock.mockReset();
});

describe("ProductDetailView out-of-stock availability (RF-06 / RN-08)", () => {
  it("shows the AGOTADO badge, hides the quantity selector, and disables the add button when the selected branch has no stock", () => {
    seedCartWithBranch(1, "Sucursal Centro");
    useProductMock.mockReturnValue({
      data: {
        ...baseProduct,
        branchId: 1,
        availableInBranches: [2],
      },
      isLoading: false,
      error: null,
    });

    render(
      <Wrapper>
        <ProductDetailView productId={baseProduct.id} />
      </Wrapper>
    );

    expect(screen.getByTestId("out-of-stock-badge")).toHaveTextContent(/Agotado/i);
    const buttons = screen.getAllByRole("button", { name: /Matcha Latte está agotado/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
    expect(screen.queryByText(/Cantidad/i)).not.toBeInTheDocument();
  });

  it("does not render the AGOTADO badge when no branch is selected even if availableInBranches is empty (global catalog)", () => {
    useProductMock.mockReturnValue({
      data: {
        ...baseProduct,
        branchId: undefined,
        availableInBranches: [],
      },
      isLoading: false,
      error: null,
    });

    render(
      <Wrapper>
        <ProductDetailView productId={baseProduct.id} />
      </Wrapper>
    );

    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: /Agregar Matcha Latte al carrito/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the Disponible badge when the selected branch is in availableInBranches", () => {
    seedCartWithBranch(2, "Sucursal Norte");
    useProductMock.mockReturnValue({
      data: {
        ...baseProduct,
        branchId: 2,
        availableInBranches: [1, 2],
      },
      isLoading: false,
      error: null,
    });

    render(
      <Wrapper>
        <ProductDetailView productId={baseProduct.id} />
      </Wrapper>
    );

    expect(screen.queryByTestId("out-of-stock-badge")).not.toBeInTheDocument();
    expect(screen.getByText(/Disponible/i)).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: /Agregar Matcha Latte al carrito/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders every add-to-cart button as disabled when the product is out of stock", () => {
    seedCartWithBranch(1, "Sucursal Centro");
    useProductMock.mockReturnValue({
      data: {
        ...baseProduct,
        branchId: 1,
        availableInBranches: [2],
      },
      isLoading: false,
      error: null,
    });

    render(
      <Wrapper>
        <ProductDetailView productId={baseProduct.id} />
      </Wrapper>
    );

    const agotadoButtons = screen.getAllByRole("button", { name: /Matcha Latte está agotado/i });
    expect(agotadoButtons.length).toBeGreaterThanOrEqual(2);
    agotadoButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
