import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const mockState = vi.hoisted(() => ({
  branchesData: [
    { id: 1, name: "Sucursal Centro", location: null, schedule: null, company_name: "Co", accepting_orders: true },
    { id: 2, name: "Sucursal Norte", location: null, schedule: null, company_name: "Co", accepting_orders: true },
  ],
  categoriesData: [] as Array<{ id: number; name: string }>,
  productsData: { count: 0, next: null, results: [] as Array<Record<string, unknown>> },
  productsLoading: false,
  productsError: null as Error | null,
  useProductsCalls: [] as Array<{ search?: string; ordering?: string; category?: number; page: number; branch?: number }>,
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => ({
    data: mockState.branchesData,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: (
    search?: string,
    ordering?: string,
    category?: number,
    page: number = 1,
    branch?: number
  ) => {
    mockState.useProductsCalls.push({ search, ordering, category, page, branch });
    return {
      data: mockState.productsData,
      isLoading: mockState.productsLoading,
      error: mockState.productsError,
    };
  },
}));

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ data: mockState.categoriesData }),
}));

import { CartProvider } from "@/context/CartContext";
import { MenuView } from "@/components/menu/MenuView";

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
  mockState.branchesData = [
    { id: 1, name: "Sucursal Centro", location: null, schedule: null, company_name: "Co", accepting_orders: true },
    { id: 2, name: "Sucursal Norte", location: null, schedule: null, company_name: "Co", accepting_orders: true },
  ];
  mockState.categoriesData = [];
  mockState.productsData = { count: 0, next: null, results: [] };
  mockState.productsLoading = false;
  mockState.productsError = null;
  mockState.useProductsCalls = [];
});

describe("MenuView branch selection", () => {
  it("shows the select-a-branch banner when no branch is selected", () => {
    render(
      <Wrapper>
        <MenuView />
      </Wrapper>
    );

    expect(screen.getByText(/Selecciona una sucursal/i)).toBeInTheDocument();
    expect(screen.queryByText(/Menú de hoy/i)).toBeInTheDocument();
  });

  it("does not offer 'Todas las sucursales' in the dropdown when branches are loaded", async () => {
    render(
      <Wrapper>
        <MenuView />
      </Wrapper>
    );

    const trigger = screen.getByRole("button", { name: /Sucursal|Selecciona/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Todas las sucursales/i })).not.toBeInTheDocument();
  });
});

describe("MenuView search and filters", () => {
  it("shows an empty-results message when the search returns no products", async () => {
    const user = userEvent.setup();
    mockState.productsData = { count: 0, next: null, results: [] };

    render(
      <Wrapper>
        <MenuView />
      </Wrapper>
    );

    await user.click(screen.getByRole("button", { name: /Sucursal|Selecciona/i }));
    await user.click(screen.getByRole("button", { name: /Sucursal Centro/i }));

    const searchInput = screen.getAllByPlaceholderText(/Busca en el menú/i)[0];
    await user.type(searchInput, "xyz123");

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument();
    });

    expect(mockState.useProductsCalls.at(-1)?.search).toBe("xyz123");
  });

  it("resets search, category and ordering when the user switches to another branch", async () => {
    const user = userEvent.setup();
    mockState.categoriesData = [{ id: 10, name: "Bebidas" }];
    mockState.productsData = {
      count: 2,
      next: null,
      results: [
        { id: 1, name: "Café", price: 50, category: { id: 10, name: "Bebidas" }, branchId: 1 },
        { id: 2, name: "Té", price: 40, category: { id: 10, name: "Bebidas" }, branchId: 1 },
      ],
    };

    render(
      <Wrapper>
        <MenuView />
      </Wrapper>
    );

    await user.click(screen.getByRole("button", { name: /Sucursal|Selecciona/i }));
    await user.click(screen.getByRole("button", { name: /Sucursal Centro/i }));

    await user.click(screen.getByRole("button", { name: /Bebidas/i }));

    const searchInput = screen.getAllByPlaceholderText(/Busca en el menú/i)[0];
    await user.type(searchInput, "café");

    await waitFor(() => {
      expect(mockState.useProductsCalls.some((c) => c.search === "café")).toBe(true);
    });

    await user.click(screen.getByRole("button", { name: /Sucursal Centro/i }));
    await user.click(screen.getByRole("button", { name: /Sucursal Norte/i }));

    await waitFor(() => {
      const lastCall = mockState.useProductsCalls.at(-1);
      expect(lastCall?.branch).toBe(2);
      expect(lastCall?.search).toBeUndefined();
      expect(lastCall?.category).toBeUndefined();
      expect(lastCall?.page).toBe(1);
    });

    expect((searchInput as HTMLInputElement).value).toBe("");
  });

  it("renders product cards when products are returned", async () => {
    const user = userEvent.setup();
    mockState.productsData = {
      count: 1,
      next: null,
      results: [
        { id: 1, name: "Café Americano", price: 50, category: { id: 10, name: "Bebidas" }, branchId: 1 },
      ],
    };

    render(
      <Wrapper>
        <MenuView />
      </Wrapper>
    );

    await user.click(screen.getByRole("button", { name: /Sucursal|Selecciona/i }));
    await user.click(screen.getByRole("button", { name: /Sucursal Centro/i }));

    expect(await screen.findByText("Café Americano")).toBeInTheDocument();
    expect(screen.getByText(/1 producto\(s\) disponible\(s\)/i)).toBeInTheDocument();
  });
});
