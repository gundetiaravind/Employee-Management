
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000,
});

// ==================== REQUEST INTERCEPTOR ====================

axiosInstance.interceptors.request.use(
  (config) => {
    let user = null;

    try {
      user = JSON.parse(
        sessionStorage.getItem("orgconnect-auth") || "null"
      );
    } catch {
      user = null;
    }

    const token = user?.accessToken;

    if (token) {
      config.headers.set
        ? config.headers.set("Authorization", `Bearer ${token}`)
        : (config.headers.Authorization = `Bearer ${token}`);
    }

    // Handle multipart and JSON requests.
    const isFormData =
      typeof FormData !== "undefined" &&
      config.data instanceof FormData;

    if (isFormData) {
      if (config.headers.delete) {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      const publicAuthRoutes = [
        "/login",
        "/register",
        "/employee/register",
        "/register/employee",
      ];

      const isPublicAuthRoute = publicAuthRoutes.some(
        (path) => currentPath === path
      );

      const auth = sessionStorage.getItem("orgconnect-auth");

      if (auth && !isPublicAuthRoute) {
        sessionStorage.removeItem("orgconnect-auth");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
