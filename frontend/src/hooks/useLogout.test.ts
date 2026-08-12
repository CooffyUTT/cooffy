import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosError } from "axios";

const postMock = vi.fn();
const pushMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    post: (...args: unknown[]) => postMock(...args),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

import { useLogout } from "@/hooks/useLogout";

function makeAxiosError(status: number, data: Record<string, unknown>): AxiosError {
  const err = new Error("Request failed") as AxiosError;
  err.isAxiosError = true;
  err.response = {
    status,
    data,
    statusText: "Error",
    headers: {},
    config: {} as never,
  };
  err.toJSON = () => ({});
  err.name = "AxiosError";
  err.message = "Request failed";
  return err;
}

function seedStorage() {
  localStorage.setItem("accessToken", "access");
  localStorage.setItem("refreshToken", "refresh-xyz");
  localStorage.setItem("userData", JSON.stringify({ name: "Alice", groups: ["cliente"] }));
  localStorage.setItem("cooffy_cart", JSON.stringify([{ id: 1, quantity: 2 }]));
  localStorage.setItem("cooffy_branch_id", "5");
  localStorage.setItem("cooffy_branch_name", "Sucursal Centro");
}

describe("useLogout", () => {
  beforeEach(() => {
    postMock.mockReset();
    pushMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("calls the logout endpoint with the refresh token, clears storage and redirects on success", async () => {
    seedStorage();
    postMock.mockResolvedValue({ data: { message: "Sesión cerrada correctamente." } });

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.performLogout();
    });

    expect(postMock).toHaveBeenCalledWith("/api/auth/logout/", {
      refresh: "refresh-xyz",
    });
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("userData")).toBeNull();
    expect(localStorage.getItem("cooffy_cart")).toBeNull();
    expect(localStorage.getItem("cooffy_branch_id")).toBeNull();
    expect(localStorage.getItem("cooffy_branch_name")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/");
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("still clears local state and redirects when the backend call fails", async () => {
    seedStorage();
    postMock.mockRejectedValue(makeAxiosError(400, { error: "Token inválido" }));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.performLogout();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("skips the backend call if there is no refresh token, but still clears state", async () => {
    localStorage.setItem("accessToken", "access");
    localStorage.setItem("userData", "{}");

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.performLogout();
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("invokes onAfterLogout callback after state is cleared", async () => {
    seedStorage();
    postMock.mockResolvedValue({ data: { message: "ok" } });
    const onAfterLogout = vi.fn();

    const { result } = renderHook(() => useLogout({ onAfterLogout }));

    await act(async () => {
      await result.current.performLogout();
    });

    expect(onAfterLogout).toHaveBeenCalledOnce();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
