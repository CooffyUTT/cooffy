import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const useOrdersMock = vi.fn();
const useUpcomingOrdersMock = vi.fn();
const useUpdateOrderStateMock = vi.fn();
const useUpdatePaymentStatusMock = vi.fn();
const useBranchesMock = vi.fn();
const useToggleAcceptingOrdersMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));

vi.mock("@/hooks/useOrders", () => ({
  useOrders: (...args: unknown[]) => useOrdersMock(...args),
  useUpcomingOrders: (...args: unknown[]) => useUpcomingOrdersMock(...args),
  useUpdateOrderState: () => useUpdateOrderStateMock(),
  useUpdatePaymentStatus: () => useUpdatePaymentStatusMock(),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => useBranchesMock(),
  useToggleAcceptingOrders: () => useToggleAcceptingOrdersMock(),
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
import { KitchenView } from "@/components/kitchen/KitchenView";

const BRANCH_ACTIVE: BranchData = {
  id: 1,
  name: "Sucursal Centro",
  location: null,
  schedule: null,
  company_name: "Co",
  accepting_orders: true,
  min_anticipation_minutes: 30,
  max_anticipation_hours: 24,
};

const BRANCH_SUSPENDED: BranchData = {
  ...BRANCH_ACTIVE,
  accepting_orders: false,
};

type BranchData = {
  id: number;
  name: string;
  location: string | null;
  schedule: string | null;
  company_name: string;
  accepting_orders: boolean;
  min_anticipation_minutes: number;
  max_anticipation_hours: number;
};

function buildToggleResult(overrides: Partial<{
  mutate: (...args: unknown[]) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}> = {}) {
  return {
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
    data: undefined,
    error: null,
    ...overrides,
  };
}

function buildUpdateResult() {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
    data: undefined,
    error: null,
  };
}

function seedUserWithBranch(branchId: number) {
  localStorage.setItem(
    "userData",
    JSON.stringify({
      user: "empleado1",
      name: "Empleado Demo",
      groups: ["empleado"],
      branch_id: branchId,
    }),
  );
}

function renderKitchen() {
  return render(<KitchenView />);
}

beforeEach(() => {
  pushMock.mockReset();
  useOrdersMock.mockReset();
  useUpcomingOrdersMock.mockReset();
  useUpdateOrderStateMock.mockReset();
  useUpdatePaymentStatusMock.mockReset();
  useBranchesMock.mockReset();
  useToggleAcceptingOrdersMock.mockReset();
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.success).mockReset();

  useOrdersMock.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  });
  useUpcomingOrdersMock.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  });
  useUpdateOrderStateMock.mockReturnValue(buildUpdateResult());
  useUpdatePaymentStatusMock.mockReturnValue(buildUpdateResult());
});

describe("KitchenView — toggle de recepción de pedidos (RF-07)", () => {
  it("inicializa el estado a partir de accepting_orders de la sucursal del usuario (true)", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    renderKitchen();

    const toggle = await screen.findByTestId("kitchen-toggle-active");
    expect(toggle).toHaveAttribute("data-state", "active");
    expect(toggle).toHaveTextContent("Pausar Pedidos");
    expect(toggle).not.toBeDisabled();
  });

  it("refleja el estado suspended desde el backend con banner visible", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_SUSPENDED],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    renderKitchen();

    const banner = await screen.findByTestId("kitchen-suspended-banner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Recepción de pedidos suspendida/i);

    const toggle = screen.getByTestId("kitchen-toggle-active");
    expect(toggle).toHaveAttribute("data-state", "suspended");
    expect(toggle).toHaveTextContent("Reanudar");

    expect(
      screen.getByTestId("kitchen-suspended-pill"),
    ).toBeInTheDocument();
  });

  it("llama al mutation con el branch_id del usuario al pulsar el toggle", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    const mutate = vi.fn();
    useToggleAcceptingOrdersMock.mockReturnValue(
      buildToggleResult({ mutate }),
    );

    const user = userEvent.setup();
    renderKitchen();

    const toggle = await screen.findByTestId("kitchen-toggle-active");
    await user.click(toggle);

    expect(mutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("muestra toast de éxito cuando el backend confirma el cambio a suspendido", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    const mutate = vi.fn((...args: unknown[]) => {
      const options = args[1] as {
        onSuccess: (branch: { id: number; name: string; accepting_orders: boolean }) => void;
      };
      options.onSuccess({
        id: 1,
        name: "Sucursal Centro",
        accepting_orders: false,
      });
    });
    useToggleAcceptingOrdersMock.mockReturnValue(
      buildToggleResult({ mutate }),
    );

    const user = userEvent.setup();
    renderKitchen();

    await user.click(await screen.findByTestId("kitchen-toggle-active"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Recepción de pedidos suspendida",
      expect.any(Object),
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("deshabilita el toggle mientras el mutation está pendiente", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(
      buildToggleResult({ isPending: true }),
    );

    renderKitchen();

    const toggle = await screen.findByTestId("kitchen-toggle-active");
    expect(toggle).toBeDisabled();
  });

  it("muestra toast de error cuando el backend rechaza el toggle", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    const mutate = vi.fn((...args: unknown[]) => {
      const options = args[1] as { onError: (err: unknown) => void };
      options.onError({
        response: { status: 500, data: { detail: "Server error" } },
      });
    });
    useToggleAcceptingOrdersMock.mockReturnValue(
      buildToggleResult({ mutate }),
    );

    const user = userEvent.setup();
    renderKitchen();

    await user.click(await screen.findByTestId("kitchen-toggle-active"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo cambiar el estado de la sucursal",
      expect.any(Object),
    );
  });

  it("confirma el pago en efectivo pendiente (RF-11)", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());
    const mutate = vi.fn((...args: unknown[]) => {
      const options = args[1] as { onSuccess?: () => void };
      options.onSuccess?.();
    });
    useUpdatePaymentStatusMock.mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      reset: vi.fn(),
      data: undefined,
      error: null,
    });
    useOrdersMock.mockReturnValue({
      data: [
        {
          id: 1,
          order_number: 101,
          date: "2026-08-12",
          branch_id: 1,
          client_id: 1,
          client_name: "Cliente A",
          total: "50.00",
          state: "pending",
          payment_method: 1,
          payment_status: "pending",
          created_at: new Date().toISOString(),
          comment: null,
          order_products: [],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderKitchen();

    const buttons = await screen.findAllByRole("button", {
      name: /CONFIRMAR PAGO/i,
    });
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { orderId: 1, status: "paid" },
        expect.any(Object),
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Pago confirmado",
      expect.any(Object),
    );
  });
});

describe("KitchenView — RF-14 pedidos anticipados", () => {
  it("muestra las pestañas COLA y PEDIDOS ANTICIPADOS", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    renderKitchen();

    expect(
      await screen.findByTestId("kitchen-tab-queue"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("kitchen-tab-upcoming"),
    ).toBeInTheDocument();
  });

  it("al cambiar a PEDIDOS ANTICIPADOS lista los pre-orders con hora de recogida", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    const pickupISO = "2026-08-15T13:30:00Z";
    const expectedPickupText = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(pickupISO));

    useUpcomingOrdersMock.mockReturnValue({
      data: [
        {
          id: 200,
          order_number: 501,
          date: "2026-08-15",
          branch_id: 1,
          client_id: 7,
          created_at: "2026-08-14T12:00:00Z",
          prepared_at: null,
          picked_up_at: null,
          scheduled_pickup_at: pickupISO,
          total: "85.00",
          iva: "6.30",
          state: "pending",
          payment_method: 1,
          payment_status: "pending",
          comment: null,
          updated_at: "2026-08-14T12:00:00Z",
          order_products: [
            {
              id: 11,
              item_id: 30,
              quantity: 2,
              price: "40.00",
              excluded_modifiers: [],
              product_name: "Torta de jamon",
            },
            {
              id: 12,
              item_id: 31,
              quantity: 1,
              price: "5.00",
              excluded_modifiers: [],
              product_name: "Cafe",
            },
          ],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderKitchen();

    await user.click(await screen.findByTestId("kitchen-tab-upcoming"));

    const list = await screen.findByTestId("kitchen-upcoming-list");
    expect(list).toBeInTheDocument();

    const row = await screen.findByTestId("kitchen-preorder-row");
    expect(row).toHaveTextContent("#501");
    expect(
      within(row).getByTestId("preorder-pickup-time").textContent,
    ).toContain(expectedPickupText);
    expect(within(row).getByTestId("preorder-products")).toHaveTextContent(
      /2 x Torta de jamon/,
    );
  });

  it("muestra el estado vacío en la pestaña de anticipados cuando no hay pre-orders", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    useUpcomingOrdersMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderKitchen();

    await user.click(await screen.findByTestId("kitchen-tab-upcoming"));

    expect(
      await screen.findByTestId("kitchen-upcoming-empty"),
    ).toHaveTextContent(/Sin pedidos anticipados pendientes/i);
  });

  it("muestra el nombre del cliente cuando client_name viene en el pre-order", async () => {
    seedUserWithBranch(1);
    useBranchesMock.mockReturnValue({
      data: [BRANCH_ACTIVE],
      isLoading: false,
    });
    useToggleAcceptingOrdersMock.mockReturnValue(buildToggleResult());

    useUpcomingOrdersMock.mockReturnValue({
      data: [
        {
          id: 201,
          order_number: 502,
          date: "2026-08-15",
          branch_id: 1,
          client_id: 7,
          client_name: "Ana Lopez",
          created_at: "2026-08-14T12:00:00Z",
          prepared_at: null,
          picked_up_at: null,
          scheduled_pickup_at: "2026-08-15T13:30:00Z",
          total: "85.00",
          iva: "6.30",
          state: "pending",
          payment_method: 1,
          payment_status: "pending",
          comment: null,
          updated_at: "2026-08-14T12:00:00Z",
          order_products: [],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    const user = userEvent.setup();
    renderKitchen();

    await user.click(await screen.findByTestId("kitchen-tab-upcoming"));

    const row = await screen.findByTestId("kitchen-preorder-row");
    expect(
      within(row).getByTestId("preorder-client-name"),
    ).toHaveTextContent("Ana Lopez");
  });
});
