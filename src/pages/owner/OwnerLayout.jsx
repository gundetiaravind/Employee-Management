
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
import "./OwnerDashboard.css";

const AUTH_KEY = "orgconnect-auth";

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read authenticated user
  const user = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(AUTH_KEY) || "null"
      );
    } catch {
      return null;
    }
  })();

  const ownerName = user?.fullName || user?.name || "Company Owner";

  const companyId =
    user?.companyId ??
    user?.company?.id ??
    user?.company?.companyId;

  // Fetch company dashboard API
  const fetchCompanyDashboard = useCallback(async () => {
    if (!companyId) {
      setError("Company ID is missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await companyService.companyDashboard(companyId);

      setCompanyData(response);
    } catch (err) {
      console.error("Company dashboard API error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load company dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyDashboard();
  }, [fetchCompanyDashboard]);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    navigate("/login", { replace: true });
  };

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
              {/* <h2>
                Org<span>Connect</span>
              </h2> */}
              {companyData && (
                <h2>
               {companyData.companyName}
              </h2> )}
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

            <button
              className="owner-mobile-logout"
              onClick={handleLogout}
            >
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
              {theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            <div className="owner-user-info">
              <UserRound size={18} />
              <span>{ownerName}</span>
            </div>

            <button
              className="owner-logout"
              onClick={handleLogout}
            >
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

      {/* COMPANY INFORMATION */}
      {/* {companyData && (
        <div className="owner-company-bar">
          <div>
            <Building2 size={17} />

            <strong>{companyData.companyName}</strong>

            <span className="company-status">
              {companyData.organizationStatus}
            </span>
          </div>

          <span>
            {companyData.accountType} Workspace
          </span>
        </div>
      )} */}

      {/* PAGE CONTENT */}
      <main className="owner-main">
        <div className="owner-page-content">

          {loading ? (
            <div className="owner-loading">
              Loading company dashboard...
            </div>
          ) : error ? (
            <div className="owner-error">
              <p>{error}</p>

              <button onClick={fetchCompanyDashboard}>
                Try Again
              </button>
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
