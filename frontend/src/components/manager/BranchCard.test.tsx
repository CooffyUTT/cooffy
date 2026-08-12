import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BranchCard } from "@/components/manager/BranchCard";
import type { Branch } from "@/types/manager";

const branch: Branch = {
  id: "1",
  name: "Sucursal Centro",
  address: "Av. Universidad 123",
  employeesCount: 4,
  schedule: "08:00 - 18:00",
  dailySales: 1500,
  status: "open",
  imageUrl: "",
  minAnticipationMinutes: 30,
  maxAnticipationHours: 24,
};

beforeEach(() => {
  if (typeof window !== "undefined") {
    window.URL.createObjectURL = vi.fn(() => "blob:test");
  }
});

describe("BranchCard — RF-14 RN-27 ventana de anticipación", () => {
  it("muestra los inputs de anticipación al entrar en modo edición", async () => {
    const user = userEvent.setup();
    render(
      <BranchCard branch={branch} onDelete={vi.fn()} onSave={vi.fn()} />,
    );

    await user.click(
      screen.getByRole("button", { name: /Modificar Sucursal Centro/i }),
    );

    expect(
      screen.getByTestId("branch-anticipation-window"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("branch-min-anticipation"),
    ).toHaveValue(30);
    expect(
      screen.getByTestId("branch-max-anticipation"),
    ).toHaveValue(24);
  });

  it("envía los valores editados al guardar la sucursal", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(async () => true);

    render(
      <BranchCard branch={branch} onDelete={vi.fn()} onSave={onSave} />,
    );

    await user.click(
      screen.getByRole("button", { name: /Modificar Sucursal Centro/i }),
    );

    const minInput = screen.getByTestId("branch-min-anticipation");
    const maxInput = screen.getByTestId("branch-max-anticipation");

    await user.clear(minInput);
    await user.type(minInput, "45");
    await user.clear(maxInput);
    await user.type(maxInput, "48");

    await user.click(screen.getByRole("button", { name: /Guardar/i }));

    expect(onSave).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        minAnticipationMinutes: 45,
        maxAnticipationHours: 48,
      }),
    );
  });
});
