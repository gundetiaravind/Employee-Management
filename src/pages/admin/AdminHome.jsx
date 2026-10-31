import {
  Users,
  Building2,
  CalendarCheck,
  ClipboardList,
  UserPlus,
  CalendarDays,
  FileText,
  ArrowUpRight,
} from "lucide-react";

import "./AdminDashboard.css";

const statistics = [
  {
    label: "Total Employees",
    value: "128",
    note: "Employees in your company",
    icon: Users,
  },
  {
    label: "Departments",
    value: "08",
    note: "Active departments",
    icon: Building2,
  },
  {
    label: "Present Today",
    value: "112",
    note: "Attendance recorded",
    icon: CalendarCheck,
  },
  {
    label: "Pending Leave Requests",
    value: "12",
    note: "Require your attention",
    icon: ClipboardList,
  },
];

const activities = [
  {
    icon: UserPlus,
    title: "New employee registered",
    description: "A new employee was added to the company.",
    time: "Today",
  },
  {
    icon: CalendarDays,
    title: "Leave request submitted",
    description: "An employee submitted a leave request for approval.",
    time: "Today",
  },
  {
    icon: FileText,
    title: "Attendance updated",
    description: "Employee attendance records were updated.",
    time: "Yesterday",
  },
];

export default function AdminHome() {
  const user = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("OrgConnect-demo-user") || "null"
      );
    } catch {
      return null;
    }
  })();

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">ADMIN OVERVIEW</span>
          <h1>Welcome back, {user?.name || "Admin"}!</h1>
          <p>
            Manage your company's employees and daily operations from one
            place.
          </p>
        </div>

        <div className="admin-welcome-icon">
          <LayoutDashboardIcon />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Company Overview</h2>
            <p>Quick summary of your company's activities</p>
          </div>
        </div>

        <div className="admin-stats-grid">
          {statistics.map(({ label, value, note, icon: Icon }) => (
            <article className="admin-stat-card" key={label}>
              <div className="admin-stat-card-top">
                <span>{label}</span>
                <div className="admin-stat-icon">
                  <Icon size={19} />
                </div>
              </div>
              <h3>{value}</h3>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-bottom">
        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest updates from your company</p>
            </div>
            <ArrowUpRight size={19} />
          </div>

          <div className="admin-activity-list">
            {activities.map(({ icon: Icon, title, description, time }) => (
              <div className="admin-activity-item" key={title}>
                <div className="admin-activity-icon">
                  <Icon size={18} />
                </div>
                <div className="admin-activity-content">
                  <strong>{title}</strong>
                  <p>{description}</p>
                  <span>{time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Admin Responsibilities</h2>
              <p>Your daily management tasks</p>
            </div>
            <ClipboardList size={20} />
          </div>

          <div className="admin-responsibility-list">
            <div>
              <span>Employee management</span>
              <strong>Manage employee records</strong>
            </div>
            <div>
              <span>Attendance</span>
              <strong>Monitor daily attendance</strong>
            </div>
            <div>
              <span>Leave requests</span>
              <strong>Review pending requests</strong>
            </div>
            <div>
              <span>Payroll</span>
              <strong>Manage salary records</strong>
            </div>
          </div>
        </div>
      </section>

      <p className="admin-demo-note">
        Dashboard preview: figures and recent activities are sample data.
        They will be connected to the company database during backend
        integration.
      </p>
    </>
  );
}

function LayoutDashboardIcon() {
  return <Building2 size={25} />;
}