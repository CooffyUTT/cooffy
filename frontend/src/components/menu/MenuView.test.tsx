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

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: { count: 0, next: null, results: [] },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ data: [] }),
}));

import { CartProvider } from "@/context/CartContext";
import { MenuView } from "@/components/menu/MenuView";

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
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
