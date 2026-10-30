
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  UserRound,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Eye,
  Trash2,
  Power,
  XCircle,
  Mail,
  CalendarDays,
  User,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import "./PlatformManagerDashboard.css";

const initialCompanies = [
  {
    id: 1,
    name: "TechNova Solutions",
    ownerName: "Rahul Sharma",
    email: "rahul@technova.com",
    registrationDate: "12 Oct 2026",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "GreenLeaf Technologies",
    ownerName: "Priya Reddy",
    email: "priya@greenleaf.com",
    registrationDate: "15 Oct 2026",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Skyline Constructions",
    ownerName: "Arjun Kumar",
    email: "arjun@skyline.com",
    registrationDate: "18 Oct 2026",
    status: "INACTIVE",
  },
  {
    id: 4,
    name: "BrightPath Systems",
    ownerName: "Sneha Patel",
    email: "sneha@brightpath.com",
    registrationDate: "21 Oct 2026",
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "UrbanNest Developers",
    ownerName: "Kiran Rao",
    email: "kiran@urbannest.com",
    registrationDate: "25 Oct 2026",
    status: "INACTIVE",
  },
];

export default function PlatformManagerDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteCompany, setDeleteCompany] = useState(null);

  const handleLogout = () => {
    sessionStorage.removeItem("platformManagerDemoAuth");
    navigate("/", { replace: true });
  };

  const handleStatusChange = (id) => {
    setCompanies((previous) =>
      previous.map((company) =>
        company.id === id
          ? {
              ...company,
              status:
                company.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : company
      )
    );
  };

  const handleDelete = () => {
    if (!deleteCompany) return;

    setCompanies((previous) =>
      previous.filter((company) => company.id !== deleteCompany.id)
    );

    if (selectedCompany?.id === deleteCompany.id) {
      setSelectedCompany(null);
    }

    setDeleteCompany(null);
  };

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(
    (company) => company.status === "ACTIVE"
  ).length;
  const inactiveCompanies = companies.filter(
    (company) => company.status === "INACTIVE"
  ).length;

  const stats = [
    {
      label: "Total Companies",
      value: totalCompanies,
      description: "Registered organizations",
      icon: Building2,
    },
    {
      label: "Active Companies",
      value: activeCompanies,
      description: "Currently active organizations",
      icon: CheckCircle2,
    },
    {
      label: "Inactive Companies",
      value: inactiveCompanies,
      description: "Currently inactive organizations",
      icon: Ban,
    },
  ];

  return (
    <div className="pm-layout">
      {/* HEADER */}
      <header className="pm-header">
        <div className="pm-header-container">
          <div className="pm-brand">
            <div className="pm-logo">
              <Building2 size={22} />
            </div>

            <div className="pm-brand-text">
              <h2>
                Org<span>Connect</span>
              </h2>
              <small>Platform Manager</small>
            </div>
          </div>

          <nav className={`pm-nav ${menuOpen ? "open" : ""}`}>
            <button
              type="button"
              className="pm-nav-link active"
              onClick={() => setMenuOpen(false)}
            >
              <Building2 size={18} />
              <span>Manage Companies</span>
            </button>

            <button
              className="pm-mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="pm-header-actions">
            <button
              className="pm-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            <div className="pm-user-info">
              <UserRound size={18} />
              <span>Platform Manager</span>
            </div>

            <button className="pm-logout" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>

            <button
              className="pm-mobile-menu"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main className="pm-main">
        <div className="pm-page-content">
          {/* PAGE HEADING */}
          <section className="pm-welcome">
            <div>
              <span className="pm-eyebrow">
                ORGCONNECT PLATFORM MANAGEMENT
              </span>

              <h1>Manage Companies</h1>

              <p>
                View, manage and monitor all organizations registered
                on the OrgConnect platform.
              </p>
            </div>

            <div className="pm-welcome-icon">
              <ShieldCheck size={27} />
            </div>
          </section>

          {/* STATISTICS */}
          <section className="pm-section">
            <div className="pm-stats-grid">
              {stats.map(({ label, value, description, icon: Icon }) => (
                <div className="pm-stat-card" key={label}>
                  <div className="pm-stat-card-top">
                    <span>{label}</span>
                    <div className="pm-stat-icon">
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3>{value}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMPANY TABLE */}
          <section className="pm-panel">
            <div className="pm-panel-heading">
              <div>
                <h2>Registered Companies</h2>
                <p>
                  {totalCompanies} companies registered on OrgConnect.
                </p>
              </div>

              <Building2 size={23} />
            </div>

            {companies.length === 0 ? (
              <div className="pm-empty-state">
                <Building2 size={38} />
                <strong>No companies registered yet</strong>
                <p>
                  Companies registered on OrgConnect will appear here.
                </p>
              </div>
            ) : (
              <div className="pm-table-wrapper">
                <table className="pm-company-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="pm-company-name">
                          {company.name}
                        </td>

                        <td>{company.ownerName}</td>
                        <td>{company.email}</td>
                        <td>{company.registrationDate}</td>

                        <td>
                          <span
                            className={`pm-status ${
                              company.status === "ACTIVE"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {company.status}
                          </span>
                        </td>

                        <td>
                          <div className="pm-company-actions">
                            <button
                              className="pm-action-button pm-view-action"
                              title="View company"
                              onClick={() => setSelectedCompany(company)}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className={`pm-action-button ${
                                company.status === "ACTIVE"
                                  ? "pm-deactivate-action"
                                  : "pm-activate-action"
                              }`}
                              title={
                                company.status === "ACTIVE"
                                  ? "Deactivate company"
                                  : "Activate company"
                              }
                              onClick={() => handleStatusChange(company.id)}
                            >
                              <Power size={16} />
                            </button>

                            <button
                              className="pm-action-button pm-delete-action"
                              title="Delete company"
                              onClick={() => setDeleteCompany(company)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="pm-demo-note">
            <ShieldCheck size={16} />
            Demo company records. Changes are temporary and will reset
            when the page is refreshed.
          </div>
        </div>
      </main>

      {/* VIEW COMPANY MODAL */}
      {selectedCompany && (
        <div
          className="pm-modal-overlay"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="pm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pm-modal-header">
              <div>
                <h2>Company Details</h2>
                <p>Organization information</p>
              </div>

              <button
                className="pm-modal-close"
                onClick={() => setSelectedCompany(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pm-company-details">
              <div className="pm-company-details-icon">
                <Building2 size={28} />
              </div>

              <h3>{selectedCompany.name}</h3>

              <span
                className={`pm-status ${
                  selectedCompany.status === "ACTIVE"
                    ? "active"
                    : "inactive"
                }`}
              >
                {selectedCompany.status}
              </span>

              <div className="pm-detail-row">
                <User size={18} />
                <div>
                  <small>Company Owner</small>
                  <strong>{selectedCompany.ownerName}</strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <Mail size={18} />
                <div>
                  <small>Email Address</small>
                  <strong>{selectedCompany.email}</strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <CalendarDays size={18} />
                <div>
                  <small>Registration Date</small>
                  <strong>{selectedCompany.registrationDate}</strong>
                </div>
              </div>
            </div>

            <button
              className="pm-modal-done"
              onClick={() => setSelectedCompany(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCompany && (
        <div
          className="pm-modal-overlay"
          onClick={() => setDeleteCompany(null)}
        >
          <div
            className="pm-modal pm-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pm-delete-icon">
              <Trash2 size={25} />
            </div>

            <h2>Delete Company?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteCompany.name}</strong>? This action cannot
              be undone.
            </p>

            <div className="pm-confirm-actions">
              <button
                className="pm-cancel-button"
                onClick={() => setDeleteCompany(null)}
              >
                Cancel
              </button>

              <button
                className="pm-confirm-delete"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Delete Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
