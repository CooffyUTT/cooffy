import axios from "axios";

// 1. Instancia base que ya tenías configurada
export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8000"),
  withCredentials: true,
});

// 2. Interceptor: Se ejecuta antes de CADA petición HTTP saliente
api.interceptors.request.use(
  (config) => {
    // Leemos el accessToken guardado en el login
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        // Adjuntamos el header Authorization: Bearer <token>
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor: Manejo global de expiración de token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        // Redirigir al login si no estás ya en la página de inicio
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);