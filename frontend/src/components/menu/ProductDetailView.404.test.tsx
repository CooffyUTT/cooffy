import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import type { Branch } from "@/hooks/useBranches";

type ProductResult =
  | null
  | { ok: true; product: Record<string, unknown> }
  | { ok: false; status: number; message: string };

const mockState = vi.hoisted(() => ({
  productResult: null as ProductResult,
  listData: { count: 0, next: null, results: [] as Array<Record<string, unknown>> },
  branches: [
    { id: 1, name: "Sucursal Centro", location: null, schedule: null, company_name: "Co", accepting_orders: true },
  ] as Branch[],
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => ({ data: mockState.branches, isLoading: false }),
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({ data: mockState.listData, isLoading: false, error: null }),
}));

vi.mock("@/hooks/useProduct", () => ({
  useProduct: (id: number) => {
    const result = mockState.productResult;
    if (result && result.ok) {
      return { data: { id, ...result.product }, isLoading: false, error: null };
    }
    if (result && !result.ok) {
      const err = new AxiosError(result.message, undefined, undefined, undefined, {
        status: result.status,
        data: {},
        statusText: "Error",
        headers: {},
        config: {} as never,
      });
      return { data: undefined, isLoading: false, error: err };
    }
    return { data: undefined, isLoading: false, error: null };
  },
}));

import { ProductDetailView } from "@/components/menu/ProductDetailView";
import { CartProvider } from "@/context/CartContext";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  localStorage.clear();
  mockState.productResult = null;
  mockState.listData = { count: 0, next: null, results: [] };
  mockState.branches = [
    {
      id: 1,
      name: "Sucursal Centro",
      location: null,
      schedule: null,
      company_name: "Co",
      accepting_orders: true,
      min_anticipation_minutes: 30,
      max_anticipation_hours: 24,
    },
  ];
});

describe("ProductDetailView not found", () => {
  it("shows a friendly not-found message and a back-to-menu button when the product is missing", async () => {
    mockState.productResult = { ok: false, status: 404, message: "Not Found" };
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ProductDetailView productId={999} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Producto no encontrado/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /Volver al menú/i });
    expect(backButton).toBeInTheDocument();

    await userEvent.setup().click(backButton);
    expect(backButton.closest("a")).toHaveAttribute("href", "/menu");
  });

  it("shows a generic error message when the failure is not a 404", async () => {
    mockState.productResult = { ok: false, status: 500, message: "Server Error" };
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ProductDetailView productId={1} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el producto/i)).toBeInTheDocument();
    });
  });
});

describe("ProductDetailView success", () => {
  it("renders the product details when the response succeeds", async () => {
    mockState.productResult = {
      ok: true,
      product: {
        name: "Café Americano",
        price: 50,
        description: "Café negro clásico",
        image: null,
        modifiers: [],
        category: { id: 10, name: "Bebidas" },
        branchId: 1,
      },
    };
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ProductDetailView productId={1} />
      </Wrapper>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Café Americano" })).toBeInTheDocument();
    expect(screen.getByText(/Café negro clásico/i)).toBeInTheDocument();
    expect(screen.getAllByText("$50.00").length).toBeGreaterThan(0);
  });
});
