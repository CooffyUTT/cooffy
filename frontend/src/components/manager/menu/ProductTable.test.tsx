import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductTable } from "./ProductTable";
import type { Product } from "@/types/product";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: "Café",
    price: "20.00",
    active: true,
    max_per_order: null,
    image: null,
    description: null,
    modifiers: [],
    created_at: "2026-08-01",
    updated_at: "2026-08-01",
    ...overrides,
  };
}

describe("ProductTable stock controls (RF-06)", () => {
  const assignMock = vi.fn();
  const removeMock = vi.fn();
  const toggleStockMock = vi.fn();

  it("does not render branch stock switches without a selected branch", () => {
    render(
      <ProductTable
        products={[makeProduct()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onAssignStock={assignMock}
        onRemoveStock={removeMock}
        onToggleStock={toggleStockMock}
      />
    );

    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("shows an assigned product and toggles 'Agotado'", async () => {
    const user = userEvent.setup();
    const product = makeProduct({ branchStocks: { 5: 1 } });

    render(
      <ProductTable
        products={[product]}
        branchId={5}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onAssignStock={assignMock}
        onRemoveStock={removeMock}
        onToggleStock={toggleStockMock}
      />
    );

    expect(screen.getByLabelText("Asignar Café a la sucursal")).toBeChecked();
    expect(screen.getByLabelText("Marcar Café como agotado")).not.toBeChecked();

    await user.click(screen.getByLabelText("Marcar Café como agotado"));

    expect(toggleStockMock).toHaveBeenCalledWith(product, true);
  });

  it("calls onAssignStock when toggling an unassigned product on", async () => {
    const user = userEvent.setup();
    const product = makeProduct({ branchStocks: {} });

    render(
      <ProductTable
        products={[product]}
        branchId={5}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onAssignStock={assignMock}
        onRemoveStock={removeMock}
        onToggleStock={toggleStockMock}
      />
    );

    expect(screen.getByLabelText("Asignar Café a la sucursal")).not.toBeChecked();
    await user.click(screen.getByLabelText("Asignar Café a la sucursal"));

    expect(assignMock).toHaveBeenCalledWith(product);
  });

  it("calls onRemoveStock when unassigning a product", async () => {
    const user = userEvent.setup();
    const product = makeProduct({ branchStocks: { 5: 0 } });

    render(
      <ProductTable
        products={[product]}
        branchId={5}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onAssignStock={assignMock}
        onRemoveStock={removeMock}
        onToggleStock={toggleStockMock}
      />
    );

    expect(screen.getByLabelText("Asignar Café a la sucursal")).toBeChecked();
    await user.click(screen.getByLabelText("Asignar Café a la sucursal"));

    expect(removeMock).toHaveBeenCalledWith(product);
  });

  it("renders the out-of-stock state as checked when stock is 0", () => {
    const product = makeProduct({ branchStocks: { 5: 0 } });

    render(
      <ProductTable
        products={[product]}
        branchId={5}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onAssignStock={assignMock}
        onRemoveStock={removeMock}
        onToggleStock={toggleStockMock}
      />
    );

    expect(screen.getByText("Agotado")).toBeInTheDocument();
    expect(screen.getByLabelText("Marcar Café como agotado")).toBeChecked();
  });
});
