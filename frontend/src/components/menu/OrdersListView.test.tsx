import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const useOrdersMock = vi.fn();
const useBranchesMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
  useParams: () => ({}),
}));

vi.mock("@/hooks/useOrders", () => ({
  useOrders: (...args: unknown[]) => useOrdersMock(...args),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => useBranchesMock(),
}));

import { OrdersListView } from "@/components/menu/OrdersListView";

const makeOrder = (overrides: Partial<{
  id: number;
  order_number: number;
  state: "pending" | "preparing" | "ready" | "picked_up" | "rejected";
  total: string;
  branch_id: number;
  payment_method: 1 | 2;
  created_at: string;
}> = {}) => ({
  id: 1,
  order_number: 101,
  date: "2026-01-15",
  branch_id: 1,
  client_id: 1,
  created_at: "2026-01-15T13:00:00Z",
  prepared_at: null,
  picked_up_at: null,
  scheduled_pickup_at: null,
  total: "120.00",
  iva: "8.89",
  state: "pending" as const,
  payment_method: 1 as const,
  payment_status: "pending" as const,
  comment: null,
  updated_at: "2026-01-15T13:00:00Z",
  order_products: [
    {
      id: 1,
      item_id: 10,
      quantity: 2,
      price: "60.00",
      excluded_modifiers: [],
      product_name: "Café Americano",
    },
  ],
  ...overrides,
});

beforeEach(() => {
  pushMock.mockClear();
  useOrdersMock.mockReset();
  useBranchesMock.mockReset();
  useBranchesMock.mockReturnValue({
    data: [
      {
        id: 1,
        name: "Sucursal Centro",
        location: null,
        schedule: null,
        company_name: "Co",
        accepting_orders: true,
      },
    ],
    isLoading: false,
  });
});

describe("OrdersListView", () => {
  it("configures useOrders with a 30s polling interval and no state filter", () => {
    useOrdersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    expect(useOrdersMock).toHaveBeenCalledWith(undefined, 30_000);
  });

  it("renders the page title and the back-to-menu button", () => {
    useOrdersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    expect(screen.getByRole("heading", { name: "Mis pedidos" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Volver al menú" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when the user has no orders", () => {
    useOrdersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    expect(screen.getByText(/Aún no tienes pedidos/i)).toBeInTheDocument();
  });

  it("shows a loading skeleton while the query is pending", () => {
    useOrdersMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    expect(screen.getByTestId("orders-loading")).toBeInTheDocument();
  });

  it("shows an error state when the query fails", () => {
    useOrdersMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Sin conexión"),
    });

    render(<OrdersListView />);

    expect(screen.getByRole("alert")).toHaveTextContent(/Sin conexión/);
  });

  it("renders one card per order with order number, branch, total, payment method and state", () => {
    useOrdersMock.mockReturnValue({
      data: [
        makeOrder({ id: 1, order_number: 101, state: "preparing", payment_method: 1 }),
        makeOrder({ id: 2, order_number: 102, state: "ready", total: "85.50", payment_method: 2 }),
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    const list = screen.getByTestId("orders-list");
    expect(within(list).getByText("Pedido #101")).toBeInTheDocument();
    expect(within(list).getByText("Pedido #102")).toBeInTheDocument();
    expect(within(list).getAllByText("Sucursal Centro").length).toBeGreaterThan(0);
    expect(within(list).getByText("$85.50")).toBeInTheDocument();
    expect(within(list).getByText("Efectivo")).toBeInTheDocument();
    expect(within(list).getByText("Tarjeta")).toBeInTheDocument();
    expect(within(list).getByText("En preparación")).toBeInTheDocument();
    expect(within(list).getByText("Listo para entregar")).toBeInTheDocument();
  });

  it("navigates to /orders/[id] when an order card is clicked", async () => {
    const user = userEvent.setup();
    useOrdersMock.mockReturnValue({
      data: [makeOrder({ id: 42, order_number: 501 })],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    await user.click(screen.getByText("Pedido #501"));

    expect(pushMock).toHaveBeenCalledWith("/orders/42");
  });

  it("navigates back to /menu when the back button is clicked", async () => {
    const user = userEvent.setup();
    useOrdersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrdersListView />);

    await user.click(screen.getByRole("button", { name: "Volver al menú" }));

    expect(pushMock).toHaveBeenCalledWith("/menu");
  });
});
