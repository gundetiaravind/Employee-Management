import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  ClipboardList,
  Wallet,
  ChartNoAxesCombined,
  UserRound,
  BriefcaseBusiness,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import "./AdminDashboard.css";

const navigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Employees", path: "/admin/employees", icon: Users },
  { label: "Departments", path: "/admin/departments", icon: Building2 },
  { label: "Attendance", path: "/admin/attendance", icon: CalendarCheck },
  { label: "Leave Management", path: "/admin/leaves", icon: ClipboardList },
  { label: "Work Allocation", path: "/admin/work-allocation", icon: BriefcaseBusiness },
  { label: "Payroll", path: "/admin/payroll", icon: Wallet },
  { label: "Reports", path: "/admin/reports", icon: ChartNoAxesCombined },
  { label: "My Profile", path: "/admin/profile", icon: UserRound },
];

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("OrgConnect-demo-user") || "null");
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = getSessionUser();

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const adminName = user.name || "Company Admin";

  const handleLogout = () => {
    sessionStorage.removeItem("OrgConnect-demo-user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-container">
          <NavLink
            to="/admin/dashboard"
            className="admin-brand"
            onClick={() => setMenuOpen(false)}
          >
            <div className="admin-logo">
              <Building2 size={22} />
            </div>

            <div className="admin-brand-text">
              <h2>
                Org<span>Connect</span>
              </h2>
              <small>Admin Workspace</small>
            </div>
          </NavLink>

          <nav className={`admin-nav ${menuOpen ? "open" : ""}`}>
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/admin/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}

            <button className="admin-mobile-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="admin-header-actions">
            <button
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <div className="admin-user-info">
              <UserRound size={18} />
              <span>{adminName}</span>
            </div>

            <button className="admin-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>

            <button
              className="admin-mobile-menu"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function AdminModulePlaceholder({ title, description }) {
  return (
    <section className="admin-placeholder">
      <div className="admin-placeholder-icon">
        <Building2 size={25} />
      </div>
      <span className="admin-eyebrow">ADMIN WORKSPACE</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="admin-placeholder-note">
        This module will be implemented in the next development step.
      </div>
    </section>
  );
}
