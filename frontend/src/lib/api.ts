import axios from "axios";

// 1. Instancia base que ya tenías configurada
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
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

// 3. Interceptor opcional: Manejo global de expiración de token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el servidor responde 401 Unauthorized, el token expiró o es inválido
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        // Opcional: Redirigir al login si no estás en la página de login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);