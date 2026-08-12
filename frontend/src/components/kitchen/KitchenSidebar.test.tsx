import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const logoutMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useLogout", () => ({
  useLogout: () => ({ logout: logoutMock, isLoading: false }),
}));

import { KitchenSidebar } from "@/components/kitchen/KitchenSidebar";

beforeEach(() => {
  logoutMock.mockReset();
  pushMock.mockReset();
});

describe("KitchenSidebar", () => {
  it("renders the logout button", () => {
    render(<KitchenSidebar />);
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText(/Cerrar sesión/i)).toBeInTheDocument();
  });

  it("calls logout when the logout button is clicked", async () => {
    const user = userEvent.setup();
    render(<KitchenSidebar />);

    await user.click(screen.getByTestId("logout-button"));

    expect(logoutMock).toHaveBeenCalledOnce();
  });
});
