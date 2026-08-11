import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// framer-motion animations can race with React re-renders in parallel test
// workers (flaky clicks landing on the wrong button). Render plain divs.
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

import { OrderCard } from "@/components/kitchen/OrderCard";
import type { KitchenOrder } from "@/types/kitchen";

const ORDER: KitchenOrder = {
  id: 1,
  order_number: 5,
  date: "2026-08-11",
  branch_id: 1,
  client_id: 1,
  client_name: "Cliente Test",
  created_at: new Date().toISOString(),
  total: "30.00",
  state: "pending",
  payment_status: "pending",
  order_products: [
    {
      id: 1,
      item_id: 10,
      quantity: 2,
      unitPrice: 15,
      item_name: "Torta",
      item_image: null,
      excluded_modifiers: [],
    },
  ],
  comment: null,
};

function renderCard(overrides?: { onSecondaryAction?: () => void }) {
  const props = {
    order: ORDER,
    actionLabel: "INICIAR PREPARACIÓN",
    actionColor: "bg-amber-500",
    onAction: vi.fn(),
    secondaryActionLabel: "RECHAZAR",
    secondaryActionColor: "bg-red-500",
    onSecondaryAction: overrides?.onSecondaryAction ?? vi.fn(),
    confirmingId: null,
    setConfirmingId: vi.fn(),
  };
  return { ...render(<OrderCard {...props} />), props };
}

describe("OrderCard reject confirmation", () => {
  it("shows confirmation before rejecting and calls onSecondaryAction only after confirming", async () => {
    const user = userEvent.setup();
    const onSecondaryAction = vi.fn();
    renderCard({ onSecondaryAction });

    // Botón RECHAZAR visible, aún no se rechaza
    const rejectButton = await screen.findByRole("button", { name: "RECHAZAR" });
    await user.click(rejectButton);
    expect(onSecondaryAction).not.toHaveBeenCalled();

    // Confirmación visible (esperar el re-render del estado)
    expect(
      await screen.findByText("¿Estás seguro que deseas rechazar este pedido?"),
    ).toBeInTheDocument();

    // Confirmar ejecuta la acción
    await user.click(await screen.findByRole("button", { name: "SÍ, RECHAZAR" }));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("cancels the rejection without calling onSecondaryAction", async () => {
    const user = userEvent.setup();
    const onSecondaryAction = vi.fn();
    renderCard({ onSecondaryAction });

    await user.click(await screen.findByRole("button", { name: "RECHAZAR" }));
    await user.click(await screen.findByRole("button", { name: "CANCELAR" }));

    expect(onSecondaryAction).not.toHaveBeenCalled();
    // De vuelta a los botones normales
    expect(await screen.findByRole("button", { name: "RECHAZAR" })).toBeInTheDocument();
  });
});
