
import axiosInstance from "../utils/axiosInstance";

const AUTH_KEY = "orgconnect-auth";

const normalizeRole = (role) =>
  String(role || "").replace(/^ROLE_/, "").toUpperCase();

// ==================== AUTH STORAGE ====================

export const getAuth = () => {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
};

export const getToken = () => getAuth()?.accessToken || null;

export const saveAuth = (data) => {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const clearAuth = () => {
  sessionStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

// ==================== ROLE MANAGEMENT ====================

export const hasRole = (allowedRoles = []) => {
  const auth = getAuth();

  if (!auth?.accessToken || !auth?.role) {
    return false;
  }

  return allowedRoles.map(normalizeRole).includes(
    normalizeRole(auth.role)
  );
};

export const getDashboardPath = (role) => {
  const routes = {
    PLATFORM_MANAGER: "/platform-manager/dashboard",
    COMPANY_OWNER: "/owner/dashboard",
    ADMIN: "/admin/dashboard",
    EMPLOYEE: "/employee/dashboard",
  };

  return routes[normalizeRole(role)] || "/login";
};

// ==================== ERROR HANDLING ====================

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message ||
    data?.detail ||
    data?.error ||
    error?.message ||
    fallback
  );
};

// ==================== LOGIN ====================

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const data = response.data;

    const authData = {
      ...data,
      role: normalizeRole(data.role),
    };

    saveAuth(authData);

    return authData;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Login failed. Please check your credentials."
      )
    );
  }
};

// ==================== CURRENT USER ====================

export const getCurrentUser = async () => {
  try {
    const auth = getAuth();

    if (!auth?.accessToken) {
      throw new Error("Please login first.");
    }

    const response = await axiosInstance.get("/api/auth/me");

    const data = response.data;

    const updatedAuth = {
      ...auth,
      userId: data.userId ?? auth.userId,
      companyId: data.companyId ?? auth.companyId ?? null,
      fullName: data.fullName ?? auth.fullName,
      email: data.email ?? auth.email,
      role: normalizeRole(data.role ?? auth.role),
    };

    saveAuth(updatedAuth);

    return updatedAuth;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to fetch user details.")
    );
  }
};

// ==================== CHANGE PASSWORD ====================

export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put(
      "/api/auth/change-password",
      passwordData
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to change password.")
    );
  }
};

// ==================== FORGOT PASSWORD ====================

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/forgot-password",
      {
        email: email.trim().toLowerCase(),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to send password reset OTP.")
    );
  }
};

// ==================== VERIFY PASSWORD OTP ====================

export const passwordVerifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/password-verify-otp",
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Invalid OTP. Please try again.")
    );
  }
};

// ==================== RESET PASSWORD ====================

export const resetPassword = async (
  email,
  newPassword,
  resetToken
) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/reset-password",
      {
        email: email.trim().toLowerCase(),
        newPassword,
        resetToken,
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to reset password.")
    );
  }
};

// ==================== DEFAULT EXPORT ====================

const authService = {
  login,
  getAuth,
  getToken,
  saveAuth,
  clearAuth,
  isAuthenticated,
  hasRole,
  getDashboardPath,
  getCurrentUser,
  changePassword,
  forgotPassword,
  passwordVerifyOtp,
  resetPassword,
};

export default authService;
