
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

// REQUEST INTERCEPTOR
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
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      typeof FormData === "undefined" ||
      !(config.data instanceof FormData)
    ) {
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("orgconnect-auth");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
