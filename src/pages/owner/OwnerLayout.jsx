import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import companyService from "../../services/companyService";
import { clearAuth, getAuth } from "../../services/authService";

import "./OwnerDashboard.css";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== AUTHENTICATED USER ====================

  const user = getAuth();
  const ownerName = user?.fullName || user?.name || "Company Owner";

  // ==================== FETCH COMPANY DASHBOARD ====================

  const fetchCompanyDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Company ID is derived from the authenticated JWT on the backend.
      const response = await companyService.companyDashboard();

      setCompanyData(response);
    } catch (err) {
      console.error("Company dashboard API error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load company dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyDashboard();
  }, [fetchCompanyDashboard]);

  // ==================== LOGOUT ====================

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // ==================== NAVIGATION ====================

  const navigation = [
    {
      label: "Dashboard",
      path: "/owner/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Manage Admins",
      path: "/owner/admins",
      icon: Users,
    },
    {
      label: "Manage Employees",
      path: "/owner/employees",
      icon: UserRound,
    },
    {
      label: "Company Settings",
      path: "/owner/company",
      icon: Building2,
    },
    {
      label: "My Profile",
      path: "/owner/profile",
      icon: UserRound,
    },
  ];

  // ==================== RENDER ====================

  return (
    <div className="owner-layout">
      {/* HEADER */}
      <header className="owner-header">
        <div className="owner-header-container">
          {/* BRAND */}
          <NavLink
            to="/owner/dashboard"
            className="owner-brand"
            onClick={() => setMenuOpen(false)}
          >
            <div className="owner-logo">
              <Building2 size={22} />
            </div>

            <div className="owner-brand-text">
              <h2>{companyData?.companyName || "OrgConnect"}</h2>

              <small>Owner Workspace</small>
            </div>
          </NavLink>

          {/* NAVIGATION */}
          <nav className={`owner-nav ${menuOpen ? "open" : ""}`}>
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/owner/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `owner-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}

            <button className="owner-mobile-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          {/* HEADER ACTIONS */}
          <div className="owner-header-actions">
            <button
              className="owner-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <div className="owner-user-info">
              <UserRound size={18} />
              <span>{ownerName}</span>
            </div>

            <button className="owner-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>

            <button
              className="owner-mobile-menu"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="owner-main">
        <div className="owner-page-content">
          {loading ? (
            <div className="owner-loading">Loading company dashboard...</div>
          ) : error ? (
            <div className="owner-error">
              <p>{error}</p>

              <button onClick={fetchCompanyDashboard}>Try Again</button>
            </div>
          ) : (
            <Outlet
              context={{
                companyData,
                loading,
                error,
                refreshCompanyDashboard: fetchCompanyDashboard,
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
