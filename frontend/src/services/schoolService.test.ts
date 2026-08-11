import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getActiveSchools } from "@/services/schoolService";

const getMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => getMock(...args),
  },
}));

describe("schoolService.getActiveSchools", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requests GET /api/schools/active/", async () => {
    getMock.mockResolvedValue({ data: [] });

    await getActiveSchools();

    expect(getMock).toHaveBeenCalledWith("/api/schools/active/");
  });

  it("returns the list of active schools from the response", async () => {
    const payload = [
      {
        id: 1,
        short_name: "UTT",
        full_name: "Universidad Tecnológica de Tijuana",
        domain_address: "ut-tijuana.edu.mx",
      },
      {
        id: 2,
        short_name: "UABC",
        full_name: "Universidad Autónoma de Baja California",
        domain_address: "uabc.edu.mx",
      },
    ];
    getMock.mockResolvedValue({ data: payload });

    await expect(getActiveSchools()).resolves.toEqual(payload);
  });

  it("propagates errors from the api call", async () => {
    getMock.mockRejectedValue(new Error("network"));

    await expect(getActiveSchools()).rejects.toThrow("network");
  });
});
