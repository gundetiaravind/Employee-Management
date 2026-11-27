import { useEffect, useState } from "react";
import { getAuth } from "../../services/authService";
import employeeDashboardService from "../../services/employeeDashboardService";
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
  return getAuth();
}

function formatCurrency(amount) {
  if (amount == null || !Number.isFinite(Number(amount))) {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDays(days) {
  if (days == null || !Number.isFinite(Number(days))) {
    return "--";
  }

  const value = Number(days);
  const formatted = Number.isInteger(value) ? value : value.toFixed(1);
  return `${formatted} ${value === 1 ? "Day" : "Days"}`;
}

function formatActivityTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDay = new Date(date);
  activityDay.setHours(0, 0, 0, 0);
  const daysAgo = Math.floor((today - activityDay) / 86400000);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const activityIcons = {
  ATTENDANCE: CheckCircle2,
  LEAVE: CalendarDays,
  TASK: BriefcaseBusiness,
  PAYROLL: Wallet,
};

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = getSessionUser();

  if (!user || user.role !== "EMPLOYEE") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
  sessionStorage.removeItem("orgconnect-auth");
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
              <span>{user.fullName || "Employee"}</span>
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
  const firstName = user?.fullName?.trim().split(" ")[0] || "Employee";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const data = await employeeDashboardService.getDashboard();
        if (active) setDashboard(data);
      } catch (requestError) {
        console.error("Failed to load employee dashboard:", requestError);
        if (active) {
          setError("Unable to load your dashboard data. Please try again later.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: "Attendance This Month",
      value: loading
        ? "..."
        : formatDays(dashboard?.attendanceDaysThisMonth),
      detail: "Present days",
      icon: CalendarCheck,
      className: "attendance",
    },
    {
      label: "Leave Balance",
      value: loading ? "..." : formatDays(dashboard?.leaveBalance),
      detail: "Available leaves",
      icon: CalendarDays,
      className: "leave",
    },
    {
      label: "Pending Tasks",
      value: loading ? "..." : dashboard?.pendingTasks ?? "--",
      detail: "Tasks to complete",
      icon: ClipboardList,
      className: "tasks",
    },
    {
      label: "Latest Net Salary",
      value: loading ? "..." : formatCurrency(dashboard?.latestNetSalary),
      detail: loading
        ? "Loading payslip..."
        : dashboard?.latestPayslipPeriod
          ? `${dashboard.latestPayslipPeriod} payslip`
          : "No payslip available",
      icon: CircleDollarSign,
      className: "salary",
    },
  ];

  const recentActivities = dashboard?.recentActivities || [];

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
            {loading ? (
              <p className="employee-activity-empty">
                Loading recent activity...
              </p>
            ) : error ? (
              <p className="employee-activity-empty">
                Recent activity is unavailable.
              </p>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Bell;

                return (
                  <div
                    className="employee-activity-item"
                    key={`${activity.type}-${activity.occurredAt}-${index}`}
                  >
                    <div className="employee-activity-icon">
                      <Icon size={18} />
                    </div>

                    <div className="employee-activity-content">
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                      <small>{formatActivityTime(activity.occurredAt)}</small>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="employee-activity-empty">
                No recent activity to show.
              </p>
            )}
          </div>
        </section>
      </div>

      {error ? (
        <div className="employee-dashboard-feedback error" role="alert">
          {error}
        </div>
      ) : (
        <div className="employee-dashboard-note">
          <CheckCircle2 size={18} />
          <span>Your dashboard reflects the latest employee records.</span>
        </div>
      )}
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