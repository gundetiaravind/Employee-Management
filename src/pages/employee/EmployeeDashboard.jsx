import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  ClipboardList,
  Wallet,
  BriefcaseBusiness,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Clock3,
  CheckCircle2,
  CalendarDays,
  CircleDollarSign,
  ArrowRight,
  Bell,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import "./EmployeeDashboard.css";

const navigation = [
  { label: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
  { label: "My Attendance", path: "/employee/attendance", icon: CalendarCheck },
  { label: "Leave Management", path: "/employee/leaves", icon: ClipboardList },
  { label: "My Payroll", path: "/employee/payroll", icon: Wallet },
  { label: "My Work", path: "/employee/work", icon: BriefcaseBusiness },
  { label: "My Profile", path: "/employee/profile", icon: UserRound },
];

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("OrgConnect-demo-user") || "null");
  } catch {
    return null;
  }
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = getSessionUser();

  if (!user || user.role !== "EMPLOYEE") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("OrgConnect-demo-user");
    navigate("/login", { replace: true });
  };

  return (
    <div className={`employee-layout employee-${theme}`}>
      <header className="employee-header">
        <div className="employee-header-container">
          <NavLink
            to="/employee/dashboard"
            className="employee-brand"
            onClick={() => setMenuOpen(false)}
          >
            <div className="employee-logo">
              <BriefcaseBusiness size={22} />
            </div>

            <div className="employee-brand-text">
              <h2>
                Org<span>Connect</span>
              </h2>
              <small>Employee Workspace</small>
            </div>
          </NavLink>

          <nav className={`employee-nav ${menuOpen ? "open" : ""}`}>
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/employee/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `employee-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}

            <button
              className="employee-mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="employee-header-actions">
            <button
              className="employee-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <div className="employee-user-info">
              <UserRound size={18} />
              <span>{user.name || "Employee"}</span>
            </div>

            <button className="employee-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>

            <button
              className="employee-mobile-menu"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main className="employee-main">
        <div className="employee-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function EmployeeHome() {
  const user = getSessionUser();
  const firstName = user?.name?.trim().split(" ")[0] || "Employee";

  const stats = [
    {
      label: "Attendance This Month",
      value: "22 Days",
      detail: "Present days",
      icon: CalendarCheck,
      className: "attendance",
    },
    {
      label: "Leave Balance",
      value: "8 Days",
      detail: "Available leaves",
      icon: CalendarDays,
      className: "leave",
    },
    {
      label: "Pending Tasks",
      value: "3",
      detail: "Tasks to complete",
      icon: ClipboardList,
      className: "tasks",
    },
    {
      label: "Latest Net Salary",
      value: "₹32,500",
      detail: "October 2026",
      icon: CircleDollarSign,
      className: "salary",
    },
  ];

  const recentActivities = [
    {
      title: "Attendance marked",
      description: "Your attendance was recorded for today.",
      time: "Today",
      icon: CheckCircle2,
    },
    {
      title: "New work assigned",
      description: "A new task has been assigned to you.",
      time: "Yesterday",
      icon: BriefcaseBusiness,
    },
    {
      title: "Payroll updated",
      description: "Your October payroll details are available.",
      time: "2 days ago",
      icon: Wallet,
    },
  ];

  return (
    <section className="employee-home">
      <div className="employee-welcome">
        <div>
          <span className="employee-eyebrow">EMPLOYEE OVERVIEW</span>
          <h1>Welcome back, {firstName}!</h1>
          <p>Here is an overview of your work and activity.</p>
        </div>

        <div className="employee-welcome-icon">
          <Bell size={22} />
        </div>
      </div>

      <div className="employee-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="employee-stat-card" key={stat.label}>
              <div className={`employee-stat-icon ${stat.className}`}>
                <Icon size={21} />
              </div>

              <div className="employee-stat-info">
                <p>{stat.label}</p>
                <h2>{stat.value}</h2>
                <span>{stat.detail}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="employee-dashboard-grid">
        <section className="employee-panel employee-quick-panel">
          <div className="employee-panel-heading">
            <div>
              <h2>Quick Access</h2>
              <p>Open your employee services</p>
            </div>
          </div>

          <div className="employee-quick-links">
            <NavLink to="/employee/attendance" className="employee-quick-link">
              <span className="quick-link-icon blue">
                <Clock3 size={20} />
              </span>
              <span>
                <strong>My Attendance</strong>
                <small>View attendance records</small>
              </span>
              <ArrowRight size={17} />
            </NavLink>

            <NavLink to="/employee/leaves" className="employee-quick-link">
              <span className="quick-link-icon purple">
                <CalendarDays size={20} />
              </span>
              <span>
                <strong>Apply for Leave</strong>
                <small>Submit and track leave requests</small>
              </span>
              <ArrowRight size={17} />
            </NavLink>

            <NavLink to="/employee/payroll" className="employee-quick-link">
              <span className="quick-link-icon green">
                <Wallet size={20} />
              </span>
              <span>
                <strong>My Payroll</strong>
                <small>View salary information</small>
              </span>
              <ArrowRight size={17} />
            </NavLink>

            <NavLink to="/employee/work" className="employee-quick-link">
              <span className="quick-link-icon orange">
                <BriefcaseBusiness size={20} />
              </span>
              <span>
                <strong>My Work</strong>
                <small>Check assigned tasks</small>
              </span>
              <ArrowRight size={17} />
            </NavLink>
          </div>
        </section>

        <section className="employee-panel employee-activity-panel">
          <div className="employee-panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest updates</p>
            </div>
          </div>

          <div className="employee-activity-list">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div className="employee-activity-item" key={activity.title}>
                  <div className="employee-activity-icon">
                    <Icon size={18} />
                  </div>

                  <div className="employee-activity-content">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                    <small>{activity.time}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="employee-dashboard-note">
        <CheckCircle2 size={18} />
        <span>
          Dashboard figures are demonstration data and will be connected to
          your employee records later.
        </span>
      </div>
    </section>
  );
}

export function EmployeeModulePlaceholder({ title, description }) {
  return (
    <section className="employee-placeholder">
      <div className="employee-placeholder-icon">
        <BriefcaseBusiness size={25} />
      </div>
      <span className="employee-eyebrow">EMPLOYEE WORKSPACE</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="employee-placeholder-note">
        This page will be implemented in the next development step.
      </div>
    </section>
  );
}