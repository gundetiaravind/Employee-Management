
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
  ChevronRight,
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
      {menuOpen && (
        <button
          className="owner-mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`owner-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="owner-sidebar-header">
          <div className="owner-logo">O</div>
          <div className="owner-brand-text">
            <h2>OrgConnect</h2>
            <span>Organization workspace</span>
          </div>

          <button
            className="owner-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="owner-nav-heading">WORKSPACE</div>

        <nav className="owner-navigation">
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
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <ChevronRight className="owner-nav-arrow" size={15} />
            </NavLink>
          ))}
        </nav>

        <div className="owner-sidebar-footer">
          <button className="owner-signout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="owner-main">
        <header className="owner-topbar">
          <div className="owner-topbar-left">
            <button
              className="owner-mobile-menu"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="owner-breadcrumb">
              <strong>Owner Workspace</strong>
            </div>
          </div>

          <div className="owner-topbar-actions">
            
  <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
 <div className="owner-workspace-top">
  <strong>
    <Building2 size={20} />
    My Organization
  </strong>
</div>

</div>
        </header>

        <div className="owner-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
