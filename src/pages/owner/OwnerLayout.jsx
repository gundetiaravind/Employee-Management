import { useState } from "react";
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
import "./OwnerDashboard.css";

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

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(
    sessionStorage.getItem("OrgConnect-demo-user") || "null"
  );

  const ownerName = user?.name || "Company Owner";

  const handleLogout = () => {
    sessionStorage.removeItem("OrgConnect-demo-user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="owner-layout">

      {/* HORIZONTAL NAVBAR */}
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
              <h2>
                Org<span>Connect</span>
              </h2>
              <small>Owner Workspace</small>
            </div>
          </NavLink>

          {/* NAVIGATION LINKS */}
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

            {/* MOBILE LOGOUT */}
            <button
              className="owner-mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          {/* RIGHT SIDE ACTIONS */}
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

            {/* MOBILE MENU BUTTON */}
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

      {/* DASHBOARD CONTENT */}
      <main className="owner-main">
        <div className="owner-page-content">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
