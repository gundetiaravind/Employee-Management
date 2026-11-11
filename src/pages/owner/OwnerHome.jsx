
import { useOutletContext } from "react-router-dom";

import {
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  TrendingUp,
  Building2,
  Activity,
  RefreshCw,
  UserPlus,
  CalendarDays,
  CheckCircle,
  Clock,
  Mail,
} from "lucide-react";

import "./OwnerDashboard.css";

export default function OwnerHome() {
  const {
    companyData,
    refreshCompanyDashboard,
  } = useOutletContext();

  if (!companyData) {
    return (
      <div className="owner-loading">
        Company dashboard data is unavailable.
      </div>
    );
  }

  const ownerName = (() => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("orgconnect-auth") || "null"
      );

      return user?.fullName || "Owner";
    } catch {
      return "Owner";
    }
  })();

  const stats = [
    {
      label: "Total Employees",
      value: companyData.totalEmployees ?? 0,
      change: `${companyData.activeEmployees ?? 0} active employees`,
      icon: Users,
    },
    {
      label: "Total Admins",
      value: companyData.totalAdmins ?? 0,
      change: `${companyData.activeAdmins ?? 0} active admins`,
      icon: ShieldCheck,
    },
    {
      label: "New Employees",
      value: companyData.employeesAddedThisMonth ?? 0,
      change: "Added this month",
      icon: UserPlus,
    },
    {
      label: "Employee Growth",
      value: `${companyData.employeesGrowthPercent ?? 0}%`,
      change: "Compared to last month",
      icon: TrendingUp,
    },
  ];

  const recentAdmins = companyData.recentAdmins || [];

  return (
    <div className="owner-dashboard">

      {/* WELCOME SECTION */}
      <section className="owner-welcome">
        <div>
          <span className="owner-eyebrow">
            COMPANY OVERVIEW
          </span>

          <h1>Welcome back, {ownerName}!</h1>

          <p>
            Here's what's happening at{" "}
            <strong>{companyData.companyName}</strong>.
          </p>
        </div>

        <div className="owner-welcome-actions">
          <button
            className="owner-refresh-button"
            onClick={refreshCompanyDashboard}
            title="Refresh dashboard"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <div className="owner-welcome-icon">
            <Building2 size={25} />
          </div>
        </div>
      </section>

      {/* ORGANIZATION OVERVIEW */}
      <section className="owner-section">

        <div className="owner-section-heading">
          <div>
            <h2>Organization Overview</h2>
            <p>Live statistics from your company.</p>
          </div>
        </div>

        <div className="owner-stats-grid">

          {stats.map(({ label, value, change, icon: Icon }) => (
            <article className="owner-stat-card" key={label}>

              <div className="owner-stat-card-top">
                <span>{label}</span>

                <div className="owner-stat-icon">
                  <Icon size={20} />
                </div>
              </div>

              <h3>{value}</h3>

              <p>{change}</p>

            </article>
          ))}

        </div>
      </section>

      {/* ADMIN AND COMPANY DETAILS */}
      <div className="owner-dashboard-bottom">

        {/* RECENT ADMINS */}
        <section className="owner-panel">

          <div className="owner-panel-heading">
            <div>
              <h2>Recent Admins</h2>
              <p>Recently added company administrators.</p>
            </div>

            <Activity size={20} />
          </div>

          {recentAdmins.length > 0 ? (
            <div className="owner-activity-list">

              {recentAdmins.map((admin) => (
                <div
                  className="owner-activity-item"
                  key={admin.id}
                >

                  <div className="owner-activity-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div className="owner-activity-content">

                    <strong>{admin.name}</strong>

                    <p>
                      <Mail size={13} />
                      {" "}{admin.email}
                    </p>

                    <p>
                      <span>Phone: {admin.phone || "N/A"}</span>
                    </p>

                    <span>
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </span>

                  </div>

                  <span
                    className={
                      admin.status?.toLowerCase() === "active"
                        ? "owner-status-active"
                        : "owner-status-inactive"
                    }
                  >
                    {admin.status}
                  </span>

                </div>
              ))}

            </div>
          ) : (
            <p>No administrators found.</p>
          )}

        </section>

        {/* COMPANY DETAILS */}
        <section className="owner-panel">

          <div className="owner-panel-heading">
            <div>
              <h2>Organization Details</h2>
              <p>Your registered company information.</p>
            </div>

            <Building2 size={20} />
          </div>

          <div className="owner-company-details">

            <div>
              <span>Company Name</span>
              <strong>{companyData.companyName || "N/A"}</strong>
            </div>

            <div>
              <span>Organization Status</span>

              <strong
                className={
                  companyData.isActive
                    ? "owner-status-active"
                    : "owner-status-inactive"
                }
              >
                {companyData.organizationStatus || "Unknown"}
              </strong>
            </div>

            <div>
              <span>Account Type</span>
              <strong>{companyData.accountType || "Owner"}</strong>
            </div>

            <div>
              <span>Company Code</span>
              <strong>{companyData.companyCode || "Not assigned"}</strong>
            </div>

            <div>
              <span>Registration Status</span>
              <strong>{companyData.registrationStatus || "N/A"}</strong>
            </div>

            <div>
              <span>Company ID</span>
              <strong>{companyData.companyId}</strong>
            </div>

          </div>

        </section>

      </div>

      {/* EMPLOYEE SUMMARY */}
      <section className="owner-panel owner-employee-summary">

        <div className="owner-panel-heading">
          <div>
            <h2>Employee Summary</h2>
            <p>Employee additions and activity.</p>
          </div>

          <Users size={20} />
        </div>

        <div className="owner-summary-grid">

          <div>
            <CalendarDays size={20} />
            <span>Added This Month</span>
            <strong>{companyData.employeesAddedThisMonth ?? 0}</strong>
          </div>

          <div>
            <Clock size={20} />
            <span>Added Last Month</span>
            <strong>{companyData.employeesAddedLastMonth ?? 0}</strong>
          </div>

          <div>
            <CheckCircle size={20} />
            <span>Active Employees</span>
            <strong>{companyData.activeEmployees ?? 0}</strong>
          </div>

          <div>
            <BriefcaseBusiness size={20} />
            <span>Inactive Admins</span>
            <strong>{companyData.inactiveAdmins ?? 0}</strong>
          </div>

        </div>

      </section>

    </div>
  );
}
