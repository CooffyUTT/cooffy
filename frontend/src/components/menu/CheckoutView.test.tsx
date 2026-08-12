import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const mutateAsyncMock = vi.fn();
const useCreateOrderMock = vi.fn();
const useBranchesMock = vi.fn();
const pushMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: vi.fn() }),
}));

vi.mock("@/hooks/useOrders", () => ({
  useCreateOrder: () => useCreateOrderMock(),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => useBranchesMock(),
}));

import { toast } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { CheckoutView } from "@/components/menu/CheckoutView";

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function seedCart() {
  localStorage.setItem(
    "cooffy_cart",
    JSON.stringify([
      {
        id: 10,
        name: "Café Americano",
        price: 50,
        quantity: 1,
        branchId: 1,
      },
    ]),
  );
  localStorage.setItem("cooffy_branch_id", JSON.stringify(1));
  localStorage.setItem("cooffy_branch_name", "Sucursal Centro");
}

function buildMutationResult(error: unknown) {
  return {
    mutateAsync: mutateAsyncMock,
    mutate: vi.fn(),
    isPending: false,
    isError: Boolean(error),
    error,
    reset: vi.fn(),
    data: undefined,
  };
}

beforeEach(() => {
  localStorage.clear();
  mutateAsyncMock.mockReset();
  useCreateOrderMock.mockReset();
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
        min_anticipation_minutes: 30,
        max_anticipation_hours: 24,
      },
    ],
    isLoading: false,
  });
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.success).mockReset();
});

async function openConfirmDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Tarjeta" }));
  await user.click(screen.getByRole("button", { name: "Confirmar pedido" }));
}

describe("CheckoutView success flow", () => {
  it("clears the cart and shows a success toast with the order number", async () => {
    seedCart();
    const createdOrder = {
      id: 7,
      order_number: 42,
      date: "2026-08-11",
      branch_id: 1,
      client_id: 1,
      created_at: "2026-08-11T15:00:00Z",
      prepared_at: null,
      picked_up_at: null,
      scheduled_pickup_at: null,
      total: "50.00",
      iva: "3.70",
      state: "pending",
      payment_method: 2,
      payment_status: "pending",
      comment: null,
      updated_at: "2026-08-11T15:00:00Z",
      order_products: [
        {
          id: 1,
          item_id: 10,
          quantity: 1,
          price: "50.00",
          excluded_modifiers: [],
          product_name: "Café Americano",
        },
      ],
    };
    mutateAsyncMock.mockResolvedValue(createdOrder);
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Pedido #42 registrado");
    });
    expect(pushMock).toHaveBeenCalledWith("/orders/7");
    expect(JSON.parse(localStorage.getItem("cooffy_cart") ?? "[]")).toHaveLength(0);
  });

  it("redirects to the order receipt after a successful order", async () => {
    seedCart();
    const createdOrder = {
      id: 8,
      order_number: 1,
      date: "2026-08-11",
      branch_id: 1,
      client_id: 1,
      created_at: "2026-08-11T15:00:00Z",
      prepared_at: null,
      picked_up_at: null,
      scheduled_pickup_at: null,
      total: "50.00",
      iva: "3.70",
      state: "pending",
      payment_method: 2,
      payment_status: "pending",
      comment: null,
      updated_at: "2026-08-11T15:00:00Z",
      order_products: [],
    };
    mutateAsyncMock.mockResolvedValue(createdOrder);
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/orders/8");
    });
    expect(JSON.parse(localStorage.getItem("cooffy_cart") ?? "[]")).toHaveLength(0);
  });
});

describe("CheckoutView error handling", () => {
  it("shows a toast with the backend detail when the order creation fails", async () => {
    seedCart();
    const axiosError = {
      response: { data: { detail: "No hay stock disponible" } },
    };
    mutateAsyncMock.mockRejectedValue(axiosError);
    useCreateOrderMock.mockReturnValue(buildMutationResult(axiosError));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo registrar el pedido",
      expect.objectContaining({ description: "No hay stock disponible" }),
    );
  });

  it("extracts the first field validation message from a multi-field error", async () => {
    seedCart();
    const axiosError = {
      response: {
        data: {
          branch_id: ["Sucursal inválida"],
          comment: ["Comentario demasiado largo"],
        },
      },
    };
    mutateAsyncMock.mockRejectedValue(axiosError);
    useCreateOrderMock.mockReturnValue(buildMutationResult(axiosError));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo registrar el pedido",
      expect.objectContaining({ description: "Sucursal inválida" }),
    );
  });

  it("falls back to error.message when the response has no detail", async () => {
    seedCart();
    const err = Object.assign(new Error("Network Error"), {});
    mutateAsyncMock.mockRejectedValue(err);
    useCreateOrderMock.mockReturnValue(buildMutationResult(err));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo registrar el pedido",
      expect.objectContaining({ description: "Network Error" }),
    );
  });

  it("shows a friendly message for the out-of-stock validation error", async () => {
    seedCart();
    const axiosError = {
      response: {
        data: {
          order_products: [
            { name: "Café Americano", reason: "out_of_stock" },
          ],
        },
      },
    };
    mutateAsyncMock.mockRejectedValue(axiosError);
    useCreateOrderMock.mockReturnValue(buildMutationResult(axiosError));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo registrar el pedido",
      expect.objectContaining({
        description: expect.stringContaining("ya no tienen stock"),
      }),
    );
  });

  it("does not navigate to the confirmation screen when the order fails", async () => {
    seedCart();
    const axiosError = {
      response: { data: { detail: "No hay stock disponible" } },
    };
    mutateAsyncMock.mockRejectedValue(axiosError);
    useCreateOrderMock.mockReturnValue(buildMutationResult(axiosError));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(screen.queryByText(/Pedido confirmado/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Tu pedido ha sido registrado/i),
    ).not.toBeInTheDocument();
  });

  it("keeps the cart intact and re-enables the confirm button so the user can retry", async () => {
    seedCart();
    const axiosError = {
      response: { data: { detail: "No hay stock disponible" } },
    };
    mutateAsyncMock.mockRejectedValue(axiosError);
    useCreateOrderMock.mockReturnValue(buildMutationResult(axiosError));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await openConfirmDialog(user);
    const confirmButton = screen.getByRole("button", { name: "Confirmar" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(JSON.parse(localStorage.getItem("cooffy_cart") ?? "[]")).toHaveLength(1);
    const retryButton = screen.getByRole("button", { name: "Confirmar pedido" });
    expect(retryButton).not.toBeDisabled();
  });
});

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function futureDateISOString(hoursAhead: number, minutesAhead = 0): string {
  const future = new Date(Date.now() + hoursAhead * 3600_000 + minutesAhead * 60_000);
  return (
    `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}` +
    `T${pad(future.getHours())}:${pad(future.getMinutes())}`
  );
}

async function switchToScheduledMode(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("mode-scheduled"));
}

describe("CheckoutView — RF-14 pedidos anticipados", () => {
  it("muestra el selector de modalidad al cargar la pantalla", () => {
    seedCart();
    mutateAsyncMock.mockResolvedValue({});
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    expect(screen.getByTestId("mode-now")).toBeInTheDocument();
    expect(screen.getByTestId("mode-scheduled")).toBeInTheDocument();
  });

  it("revela el input de fecha y hora al elegir 'Pedido anticipado'", async () => {
    seedCart();
    mutateAsyncMock.mockResolvedValue({});
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    expect(screen.queryByTestId("scheduled-pickup-input")).not.toBeInTheDocument();

    await switchToScheduledMode(user);

    expect(await screen.findByTestId("scheduled-pickup-input")).toBeInTheDocument();
  });

  it("envía scheduled_pickup_at al confirmar con un valor válido dentro de la ventana", async () => {
    seedCart();
    const createdOrder = {
      id: 99,
      order_number: 12,
      date: "2026-08-11",
      branch_id: 1,
      client_id: 1,
      created_at: "2026-08-11T15:00:00Z",
      prepared_at: null,
      picked_up_at: null,
      scheduled_pickup_at: null,
      total: "50.00",
      iva: "3.70",
      state: "pending",
      payment_method: 2,
      payment_status: "pending",
      comment: null,
      updated_at: "2026-08-11T15:00:00Z",
      order_products: [],
    };
    mutateAsyncMock.mockResolvedValue(createdOrder);
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: "Tarjeta" }));
    await switchToScheduledMode(user);

    const validValue = futureDateISOString(2);
    const input = await screen.findByTestId("scheduled-pickup-input");
    fireEvent.change(input, { target: { value: validValue } });

    await user.click(screen.getByRole("button", { name: "Confirmar pedido" }));
    await user.click(await screen.findByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
    });

    const payloadArg = mutateAsyncMock.mock.calls[0][0] as {
      scheduled_pickup_at?: string;
    };
    expect(payloadArg.scheduled_pickup_at).toBeDefined();
    expect(() => new Date(payloadArg.scheduled_pickup_at!).toString()).not.toThrow();
  });

  it("muestra error inline y bloquea la confirmación cuando el valor está fuera de la ventana", async () => {
    seedCart();
    mutateAsyncMock.mockResolvedValue({});
    useCreateOrderMock.mockReturnValue(buildMutationResult(undefined));

    const user = userEvent.setup();
    render(
      <Wrapper>
        <CheckoutView />
      </Wrapper>,
    );

    await switchToScheduledMode(user);

    const input = await screen.findByTestId("scheduled-pickup-input");
    fireEvent.change(input, { target: { value: futureDateISOString(48) } });

    expect(await screen.findByTestId("scheduled-pickup-error")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirmar pedido" });
    expect(confirmButton).toBeDisabled();

    await user.click(confirmButton);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
