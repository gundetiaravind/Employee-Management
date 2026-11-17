
const API_URL = "http://localhost:8080/api/auth";
const AUTH_KEY = "orgconnect-auth";

const normalizeRole = (role) =>
  String(role || "").replace(/^ROLE_/, "").toUpperCase();

// Get saved authentication data
export const getAuth = () => {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
};

// Get JWT token
export const getToken = () => getAuth()?.accessToken || null;

// Save authentication data, including companyId
export const saveAuth = (data) => {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

// Clear authentication data
export const clearAuth = () => {
  sessionStorage.removeItem(AUTH_KEY);
};

// Check authentication
export const isAuthenticated = () => Boolean(getToken());

// Check user role
export const hasRole = (allowedRoles = []) => {
  const auth = getAuth();

  if (!auth?.accessToken || !auth?.role) return false;

  return allowedRoles.map(normalizeRole).includes(
    normalizeRole(auth.role)
  );
};

// Get dashboard route based on role
export const getDashboardPath = (role) => {
  const routes = {
    PLATFORM_MANAGER: "/platform-manager/dashboard",
    COMPANY_OWNER: "/owner/dashboard",
    ADMIN: "/admin/dashboard",
    EMPLOYEE: "/employee/dashboard",
  };

  return routes[normalizeRole(role)] || "/login";
};

// Get currently logged-in user
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

  // Preserve companyId received during login.
  const updatedAuth = {
    ...auth,
    userId: data.userId,
    companyId: data.companyId ?? auth.companyId ?? null,
    fullName: data.fullName,
    email: data.email,
    role: normalizeRole(data.role),
  };

  saveAuth(updatedAuth);

  return updatedAuth;
};

// Change password
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
