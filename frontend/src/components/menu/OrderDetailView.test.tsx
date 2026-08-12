import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const useOrderMock = vi.fn();
const useBranchesMock = vi.fn();
const useCancelOrderMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
  useParams: () => ({ id: "42" }),
}));

vi.mock("@/hooks/useOrders", () => ({
  useOrder: (...args: unknown[]) => useOrderMock(...args),
  useCancelOrder: () => useCancelOrderMock(),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => useBranchesMock(),
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
import { OrderDetailView } from "@/components/menu/OrderDetailView";

const makeOrder = (
  overrides: Partial<{
    id: number;
    order_number: number;
    state:
      | "pending"
      | "preparing"
      | "ready"
      | "picked_up"
      | "rejected"
      | "cancelled";
    total: string;
    iva: string;
    branch_id: number;
    payment_method: 1 | 2;
    payment_status: "pending" | "paid";
    created_at: string;
    estimated_completion_minutes: number | null;
    comment: string | null;
    scheduled_pickup_at: string | null;
  }> = {},
) => ({
  id: 42,
  order_number: 700,
  date: "2026-01-15",
  branch_id: 1,
  client_id: 1,
  created_at: "2026-01-15T12:30:00Z",
  prepared_at: null,
  picked_up_at: null,
  scheduled_pickup_at: null,
  total: "150.00",
  iva: "11.11",
  state: "preparing" as const,
  payment_method: 2 as const,
  payment_status: "paid" as const,
  comment: null,
  updated_at: "2026-01-15T12:30:00Z",
  order_products: [
    {
      id: 1,
      item_id: 10,
      quantity: 2,
      price: "60.00",
      excluded_modifiers: [],
      product_name: "Café Americano",
    },
    {
      id: 2,
      item_id: 11,
      quantity: 1,
      price: "30.00",
      excluded_modifiers: [],
      product_name: "Croissant",
    },
  ],
  estimated_completion_minutes: null,
  ...overrides,
});

function buildCancelResult(
  overrides: Partial<{
    mutate: (...args: unknown[]) => void;
    isPending: boolean;
    reset: () => void;
  }> = {},
) {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
    data: undefined,
    error: null,
    ...overrides,
  };
}

beforeEach(() => {
  pushMock.mockClear();
  useOrderMock.mockReset();
  useBranchesMock.mockReset();
  useCancelOrderMock.mockReset();
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.success).mockReset();
  useBranchesMock.mockReturnValue({
    data: [
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
    ],
    isLoading: false,
  });
  useCancelOrderMock.mockReturnValue(buildCancelResult());
});

describe("OrderDetailView", () => {
  it("configures useOrder with a 15s polling interval for the order id from the route", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder(),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(useOrderMock).toHaveBeenCalledWith(42, 15_000);
  });

  it("shows a loading state while the order is being fetched", () => {
    useOrderMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.getByText(/Cargando pedido/i)).toBeInTheDocument();
  });

  it("shows an error state with a link back to the list when the query fails", async () => {
    const user = userEvent.setup();
    useOrderMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Pedido no encontrado"),
    });

    render(<OrderDetailView />);

    expect(screen.getByText(/No se encontró el pedido/i)).toBeInTheDocument();
    const errorLink = screen.getByText(/Volver a mis pedidos/i);
    await user.click(errorLink);
    expect(pushMock).toHaveBeenCalledWith("/orders");
  });

  it("renders the order number, state and full summary", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder(),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.getByTestId("order-number")).toHaveTextContent("#700");
    expect(screen.getByTestId("order-state-badge")).toHaveTextContent(
      "En preparación",
    );
    expect(screen.getByText("Tarjeta")).toBeInTheDocument();
    expect(screen.getByTestId("payment-status")).toHaveTextContent("Pagado");
    expect(screen.getByText("Sucursal Centro")).toBeInTheDocument();
    expect(screen.getByText("Café Americano")).toBeInTheDocument();
    expect(screen.getByText("Croissant")).toBeInTheDocument();
    expect(screen.getByText(/Productos \(2\)/)).toBeInTheDocument();
    expect(screen.getByTestId("summary-total")).toHaveTextContent("$150.00");
  });

  it("highlights the current step on the progress stepper", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "preparing" }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    const stepper = screen.getByTestId("progress-stepper");
    const currentStep = within(stepper).getByTestId("progress-step-preparing");
    expect(currentStep).toHaveAttribute("data-state", "current");
  });

  it("shows the rejection message when the order is rejected", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "rejected" }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.getByTestId("progress-rejected")).toHaveTextContent(
      /Pedido rechazado/i,
    );
  });

  it("shows the estimated completion time when provided and the order is in progress", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "preparing", estimated_completion_minutes: 12 }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    const section = screen.getByTestId("estimated-time");
    expect(section).toHaveTextContent("Tiempo estimado");
    expect(section).toHaveTextContent("12 min");
  });

  it("hides the estimated completion time when the order is picked up", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "picked_up", estimated_completion_minutes: 5 }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.queryByTestId("estimated-time")).not.toBeInTheDocument();
  });

  it("navigates back to /orders when the header back button is clicked", async () => {
    const user = userEvent.setup();
    useOrderMock.mockReturnValue({
      data: makeOrder(),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    await user.click(
      screen.getByRole("button", { name: "Volver a mis pedidos" }),
    );

    expect(pushMock).toHaveBeenCalledWith("/orders");
  });
});

describe("OrderDetailView — RF-14 pedidos anticipados", () => {
  it("muestra la hora de recogida programada cuando el pedido la incluye", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({
        state: "pending",
        scheduled_pickup_at: "2026-08-20T13:30:00Z",
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    const scheduledRow = screen.getByTestId("scheduled-pickup");
    expect(scheduledRow).toBeInTheDocument();
    expect(scheduledRow).toHaveTextContent(/Recogida programada/i);
  });

  it("oculta la sección de recogida cuando el pedido no es anticipado", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ scheduled_pickup_at: null }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.queryByTestId("scheduled-pickup")).not.toBeInTheDocument();
  });

  it("muestra el botón 'Cancelar pedido' solo cuando hay recogida programada y el estado es pending", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({
        state: "pending",
        scheduled_pickup_at: "2026-08-20T13:30:00Z",
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(
      screen.getByTestId("cancel-order-button"),
    ).toBeInTheDocument();
  });

  it("oculta el botón de cancelar cuando el pedido no es anticipado", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "pending", scheduled_pickup_at: null }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(
      screen.queryByTestId("cancel-order-button"),
    ).not.toBeInTheDocument();
  });

  it("oculta el botón de cancelar cuando el pedido anticipado ya está preparing", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({
        state: "preparing",
        scheduled_pickup_at: "2026-08-20T13:30:00Z",
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(
      screen.queryByTestId("cancel-order-button"),
    ).not.toBeInTheDocument();
  });

  it("muestra un banner neutro de cancelación cuando el estado es cancelled", () => {
    useOrderMock.mockReturnValue({
      data: makeOrder({ state: "cancelled" }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<OrderDetailView />);

    expect(screen.getByTestId("progress-cancelled")).toHaveTextContent(
      /Pedido cancelado/i,
    );
  });

  it("flujo de cancelación exitosa muestra toast y limpia el diálogo", async () => {
    const mutate = vi.fn((...args: unknown[]) => {
      const options = args[1] as {
        onSuccess: () => void;
      };
      options.onSuccess();
    });
    useCancelOrderMock.mockReturnValue(buildCancelResult({ mutate }));

    useOrderMock.mockReturnValue({
      data: makeOrder({
        state: "pending",
        scheduled_pickup_at: "2026-08-20T13:30:00Z",
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<OrderDetailView />);

    await user.click(
      await screen.findByTestId("cancel-order-button"),
    );
    await user.click(
      await screen.findByTestId("confirm-cancel-order"),
    );

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Pedido cancelado");
  });

  it("muestra toast de error cuando el backend rechaza la cancelación", async () => {
    const mutate = vi.fn((...args: unknown[]) => {
      const options = args[1] as {
        onError: (err: unknown) => void;
      };
      options.onError({
        response: { data: { detail: "Ya no se puede cancelar" } },
      });
    });
    useCancelOrderMock.mockReturnValue(buildCancelResult({ mutate }));

    useOrderMock.mockReturnValue({
      data: makeOrder({
        state: "pending",
        scheduled_pickup_at: "2026-08-20T13:30:00Z",
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<OrderDetailView />);

    await user.click(
      await screen.findByTestId("cancel-order-button"),
    );
    await user.click(
      await screen.findByTestId("confirm-cancel-order"),
    );

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No se pudo cancelar el pedido",
        expect.objectContaining({
          description: "Ya no se puede cancelar",
        }),
      );
    });
  });
});
