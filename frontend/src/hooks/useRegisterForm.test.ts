import { act, renderHook, waitFor } from "@testing-library/react";
import type { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const pushMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

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

import { useRegisterForm } from "@/hooks/useRegisterForm";

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

function changeInput(
  result: { current: ReturnType<typeof useRegisterForm> },
  name: string,
  value: string | boolean,
  type: string = "text"
) {
  act(() => {
    result.current.handleInputChange({
      target: {
        name,
        value: type === "checkbox" ? String(value) : (value as string),
        type,
        checked: type === "checkbox" ? Boolean(value) : undefined,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  });
}

function fillValidForm(result: { current: ReturnType<typeof useRegisterForm> }) {
  changeInput(result, "name", "Juan");
  changeInput(result, "lastname", "Pérez");
  changeInput(result, "user", "juan@utt.edu.mx", "email");
  changeInput(result, "school_id", "1");
  changeInput(result, "password", "Secret#123", "password");
  changeInput(result, "confirmPassword", "Secret#123", "password");
  changeInput(result, "acceptedTerms", true, "checkbox");
}

describe("useRegisterForm", () => {
  beforeEach(() => {
    postMock.mockReset();
    pushMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts with an empty form and invalid state", () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.formData.name).toBe("");
    expect(result.current.formData.school_id).toBe("");
    expect(result.current.isFormValid).toBe(false);
    expect(result.current.isFieldValid("school_id")).toBe(false);
    expect(result.current.errors.school_id).toBeUndefined();
  });

  it("rejects emails without .edu.mx TLD", () => {
    const { result } = renderHook(() => useRegisterForm());

    changeInput(result, "user", "juan@gmail.com", "email");

    expect(result.current.errors.user).toMatch(/\.edu\.mx/);
  });

  it("requires selecting a school when none is chosen", () => {
    const { result } = renderHook(() => useRegisterForm());

    changeInput(result, "school_id", "");

    expect(result.current.errors.school_id).toBe("Este campo es requerido.");

    changeInput(result, "school_id", "3");
    expect(result.current.formData.school_id).toBe(3);
    expect(result.current.errors.school_id).toBe("");
    expect(result.current.isFieldValid("school_id")).toBe(true);
  });

  it("sends JSON payload with numeric school_id and persists tokens on success", async () => {
    postMock.mockResolvedValue({
      data: {
        message: "ok",
        access: "access-token",
        refresh: "refresh-token",
        user: { id: 7, user: "juan@utt.edu.mx", groups: ["cliente"] },
      },
    });

    const { result } = renderHook(() => useRegisterForm());
    fillValidForm(result);

    expect(result.current.isFormValid).toBe(true);

    await act(async () => {
      await result.current.handleRegister({
        preventDefault: () => undefined,
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(postMock).toHaveBeenCalledWith("/api/auth/register/", {
      user: "juan@utt.edu.mx",
      name: "Juan",
      lastname: "Pérez",
      password: "Secret#123",
      school_id: 1,
    });
    expect(localStorage.getItem("accessToken")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    expect(localStorage.getItem("userData")).toContain("cliente");
    expect(pushMock).toHaveBeenCalledWith("/menu");
    expect(toastSuccessMock).toHaveBeenCalled();
  });

  it("maps backend non_field_errors to the user error", async () => {
    postMock.mockRejectedValue(
      makeAxiosError(400, {
        non_field_errors: ["Debe utilizar un correo institucional."],
      })
    );

    const { result } = renderHook(() => useRegisterForm());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister({
        preventDefault: () => undefined,
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.user).toContain("correo institucional");
    expect(toastErrorMock).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("maps backend school_id error to the school field", async () => {
    postMock.mockRejectedValue(
      makeAxiosError(400, {
        school_id: "La escuela seleccionada no existe.",
      })
    );

    const { result } = renderHook(() => useRegisterForm());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister({
        preventDefault: () => undefined,
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.school_id).toContain("no existe");
  });

  it("shows a generic toast on a network error without mapping fields", async () => {
    postMock.mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useRegisterForm());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister({
        preventDefault: () => undefined,
      } as React.FormEvent<HTMLFormElement>);
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("blocks submission when the form is invalid", async () => {
    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleRegister({
        preventDefault: () => undefined,
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith("Formulario no válido");
  });

  it("flags password mismatch through confirmPassword validation", () => {
    const { result } = renderHook(() => useRegisterForm());

    changeInput(result, "password", "Secret#123", "password");
    changeInput(result, "confirmPassword", "Different#123", "password");

    expect(result.current.errors.confirmPassword).toMatch(/no coinciden/i);
  });
});
