
import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  UserPlus,
  ClipboardList,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { getAuth } from "../../services/authService";
import "./AdminDashboard.css";

export default function AdminHome() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getAuth();
  const adminName = user?.fullName || user?.name || "Admin";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get("/api/company/employees");

        setEmployees(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Unable to load company statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeEmployees = employees.filter(
    (employee) =>
      String(employee.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const departments = new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ).size;

  const statistics = [
    {
      label: "Total Employees",
      value: employees.length,
      note: "Employees in your company",
      icon: Users,
    },
    {
      label: "Active Employees",
      value: activeEmployees,
      note: "Currently active employees",
      icon: UserCheck,
    },
    {
      label: "Departments",
      value: departments,
      note: "Departments represented",
      icon: Building2,
    },
    {
      label: "New Employees",
      value: employees.filter((employee) => {
        if (!employee.createdAt) return false;

        const created = new Date(employee.createdAt);
        const now = new Date();

        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }).length,
      note: "Added this month",
      icon: UserPlus,
    },
  ];

  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">ADMIN OVERVIEW</span>
          <h1>Welcome back, {adminName}!</h1>
          <p>
            Manage your company's employees and daily operations from one
            place.
          </p>
        </div>

        <div className="admin-welcome-icon">
          <Building2 size={25} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <h2>Company Overview</h2>
            <p>Live employee statistics from your company</p>
          </div>
        </div>

        {loading ? (
          <p>Loading company statistics...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : (
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
        )}
      </section>

      <section className="admin-panel">
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
      </section>
    </>
  );
}
