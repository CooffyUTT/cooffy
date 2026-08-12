import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const logoutMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useLogout", () => ({
  useLogout: () => ({ performLogout: logoutMock, isLoading: false }),
}));

import { UserMenu } from "@/components/layout/UserMenu";

beforeEach(() => {
  logoutMock.mockReset();
  pushMock.mockReset();
});

describe("UserMenu", () => {
  it("renders the trigger button with the user name", () => {
    render(<UserMenu userName="Alice" />);

    const trigger = screen.getByTestId("user-menu-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("title", "Alice");
  });

  it("accepts a custom className for the trigger", () => {
    render(<UserMenu userName="Bob" className="custom-class" />);

    const trigger = screen.getByTestId("user-menu-trigger");
    expect(trigger.className).toContain("custom-class");
  });
});
