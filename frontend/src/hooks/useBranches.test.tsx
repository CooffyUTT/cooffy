import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    post: (...args: unknown[]) => postMock(...args),
    get: (...args: unknown[]) => getMock(...args),
  },
}));

const getMock = vi.fn();

import {
  useBranches,
  useToggleAcceptingOrders,
  type Branch,
} from "@/hooks/useBranches";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    queryClient,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

const initialBranches: Branch[] = [
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
  {
    id: 2,
    name: "Sucursal Norte",
    location: null,
    schedule: null,
    company_name: "Co",
    accepting_orders: true,
    min_anticipation_minutes: 30,
    max_anticipation_hours: 24,
  },
];

describe("useToggleAcceptingOrders", () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /api/branches/{id}/toggle-accepting/ on mutate", async () => {
    postMock.mockResolvedValue({
      data: { id: 1, name: "Sucursal Centro", accepting_orders: false },
    });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useToggleAcceptingOrders(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate(1);
    });

    expect(postMock).toHaveBeenCalledWith(
      "/api/branches/1/toggle-accepting/",
    );
  });

  it("updates the cached accepting_orders optimistically and exposes the toggle pending state", async () => {
    let resolveToggle!: (value: { data: Branch }) => void;
    postMock.mockImplementation(
      () =>
        new Promise<{ data: Branch }>((resolve) => {
          resolveToggle = resolve;
        }),
    );

    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["branches-public"], initialBranches);

    const useBoth = () => ({
      toggle: useToggleAcceptingOrders(),
      branches: useBranches(),
    });
    const { result } = renderHook(useBoth, { wrapper: Wrapper });

    act(() => {
      result.current.toggle.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.toggle.isPending).toBe(true);
    });

    const stillOld = queryClient.getQueryData<Branch[]>(["branches-public"]);
    expect(stillOld?.find((b) => b.id === 1)?.accepting_orders).toBe(true);

    await act(async () => {
      resolveToggle({
        data: {
          id: 1,
          name: "Sucursal Centro",
          location: null,
          schedule: null,
          company_name: "Co",
          accepting_orders: false,
          min_anticipation_minutes: 30,
          max_anticipation_hours: 24,
        },
      });
    });

    await waitFor(() => {
      expect(result.current.toggle.isSuccess).toBe(true);
    });
    expect(result.current.toggle.isPending).toBe(false);
  });

  it("exposes isError when the backend rejects the toggle", async () => {
    postMock.mockRejectedValue({
      response: { status: 500, data: { detail: "Server error" } },
    });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useToggleAcceptingOrders(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("invalidates the branches-public query on success so consumers refetch", async () => {
    postMock.mockResolvedValue({
      data: { id: 1, name: "Sucursal Centro", accepting_orders: false },
    });

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useToggleAcceptingOrders(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const invalidated = invalidateSpy.mock.calls
      .map((call) => call[0] as { queryKey?: unknown[] })
      .filter((cfg) => Array.isArray(cfg.queryKey))
      .map((cfg) => cfg.queryKey![0]);
    expect(invalidated).toContain("branches-public");
  });
});
