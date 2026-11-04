
const API_URL = "http://localhost:8080/api/auth";
const AUTH_KEY = "orgconnect-auth";

const normalizeRole = (role) =>
  String(role || "").replace(/^ROLE_/, "").toUpperCase();

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

export const hasRole = (allowedRoles = []) => {
  const auth = getAuth();

  if (!auth?.accessToken || !auth?.role) return false;

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

export const getCurrentUser = async () => {
  const auth = getAuth();

  if (!auth?.accessToken) {
    throw new Error("Please login first.");
  }

  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `${auth.tokenType || "Bearer"} ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) clearAuth();

    throw new Error(data.message || "Unable to fetch user details.");
  }

  const updatedAuth = {
    ...auth,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: normalizeRole(data.role),
  };

  saveAuth(updatedAuth);

  return updatedAuth;
};

export const changePassword = async (passwordData) => {
  const auth = getAuth();

  if (!auth?.accessToken) {
    throw new Error("Please login first.");
  }

  const response = await fetch(`${API_URL}/change-password`, {
    method: "PUT",
    headers: {
      Authorization: `${auth.tokenType || "Bearer"} ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) clearAuth();

    throw new Error(data.message || "Unable to change password.");
  }

  return data;
};
