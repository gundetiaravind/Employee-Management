
import { useCallback, useEffect, useMemo, useState } from "react";
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
  ShieldCheck,
  Eye,
  XCircle,
  Mail,
  CalendarDays,
  User,
  MapPin,
  Phone,
  RefreshCw,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { getAuth, getToken, clearAuth } from "../../services/authService";
import "./PlatformManagerDashboard.css";

const API_URL = "http://localhost:8080/api/platform/companies";

const normalizeStatus = (status) =>
  String(status || "").toUpperCase();

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Display inconsistent legacy records clearly.
const getDisplayStatus = (company) => {
  const status = normalizeStatus(company.companyStatus);

  if (status === "ACTIVE" && !company.ownerEmailVerified) {
    return "REQUIRES REVIEW";
  }

  return status.replaceAll("_", " ") || "UNKNOWN";
};

const getStatusClass = (company) => {
  const status = normalizeStatus(company.companyStatus);

  if (status === "ACTIVE" && !company.ownerEmailVerified) {
    return "review";
  }

  switch (status) {
    case "APPROVED":
      return "active";

    case "PENDING_APPROVAL":
    case "PENDING_VERIFICATION":
      return "pending";

    case "REJECTED":
    case "INACTIVE":
    case "BLOCKED":
      return "inactive";

    case "ACTIVE":
      return "active";

    default:
      return "inactive";
  }
};

const isPendingApproval = (company) =>
  normalizeStatus(company.companyStatus) === "PENDING_APPROVAL";

const canReviewCompany = (company) =>
  isPendingApproval(company) && company.ownerEmailVerified === true;

export default function PlatformManagerDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const auth = getAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  const loadCompanies = useCallback(async () => {
    const token = getToken();

    if (!token) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => []);

      if (response.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load registered companies."
        );
      }

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleCompanyAction = async (company, action) => {
    if (!isPendingApproval(company)) {
      setError("Only companies awaiting approval can be reviewed.");
      return;
    }

    if (action === "approve" && !company.ownerEmailVerified) {
      setError(
        "This owner must verify their email before the company can be approved."
      );
      return;
    }

    const actionLabel = action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${company.companyName}?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }

    setActionLoading(`${company.companyId}-${action}`);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${company.companyId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${actionLabel} this company.`
        );
      }

      setSelectedCompany(null);
      await loadCompanies();
    } catch (err) {
      setError(err.message || "Company action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCompanies = useMemo(() => {
    if (filterStatus === "ALL") {
      return companies;
    }

    return companies.filter((company) => {
      const status = normalizeStatus(company.companyStatus);

      if (filterStatus === "REQUIRES_REVIEW") {
        return status === "ACTIVE" && !company.ownerEmailVerified;
      }

      return status === filterStatus;
    });
  }, [companies, filterStatus]);

  const totalCompanies = companies.length;

  // Only PENDING_APPROVAL companies count as awaiting Platform Manager review.
  const pendingCompanies = companies.filter(
    (company) => normalizeStatus(company.companyStatus) === "PENDING_APPROVAL"
  ).length;

  // Only APPROVED counts as officially approved.
  const approvedCompanies = companies.filter(
    (company) => normalizeStatus(company.companyStatus) === "APPROVED"
  ).length;

  const rejectedCompanies = companies.filter(
    (company) => normalizeStatus(company.companyStatus) === "REJECTED"
  ).length;

  const stats = [
    {
      label: "Total Companies",
      value: totalCompanies,
      description: "Registered organizations",
      icon: Building2,
    },
    {
      label: "Pending Approvals",
      value: pendingCompanies,
      description: "Awaiting your review",
      icon: LoaderCircle,
    },
    {
      label: "Approved Companies",
      value: approvedCompanies,
      description: "Officially approved organizations",
      icon: CheckCircle2,
    },
    {
      label: "Rejected Companies",
      value: rejectedCompanies,
      description: "Rejected registrations",
      icon: XCircle,
    },
  ];

  return (
    <div className="pm-layout">
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
              type="button"
              className="pm-mobile-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </nav>

          <div className="pm-header-actions">
            <button
              type="button"
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
              <span>{auth?.fullName || "Platform Manager"}</span>
            </div>

            <button
              type="button"
              className="pm-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>

            <button
              type="button"
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
          <section className="pm-welcome">
            <div>
              <span className="pm-eyebrow">
                ORGCONNECT PLATFORM MANAGEMENT
              </span>

              <h1>Manage Companies</h1>

              <p>
                View, review and manage organizations registered
                on the OrgConnect platform.
              </p>
            </div>

            <div className="pm-welcome-icon">
              <ShieldCheck size={27} />
            </div>
          </section>

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

          <section className="pm-panel">
            <div className="pm-panel-heading">
              <div>
                <h2>Registered Companies</h2>
                <p>
                  {filteredCompanies.length} of {totalCompanies} companies
                  displayed.
                </p>
              </div>

              <div className="pm-table-controls">
                <select
                  className="pm-status-filter"
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  aria-label="Filter companies by status"
                >
                  <option value="ALL">All Companies</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="PENDING_VERIFICATION">
                    Pending Verification
                  </option>
                  <option value="APPROVED">Approved</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REQUIRES_REVIEW">Requires Review</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <button
                  type="button"
                  className="pm-refresh-button"
                  onClick={loadCompanies}
                  disabled={loading}
                  title="Refresh companies"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div className="pm-error-message" role="alert">
                <span>{error}</span>
                <button type="button" onClick={loadCompanies}>
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="pm-empty-state">
                <LoaderCircle size={34} />
                <strong>Loading companies...</strong>
                <p>Fetching company information from the server.</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="pm-empty-state">
                <Building2 size={38} />
                <strong>
                  {companies.length === 0
                    ? "No companies registered yet"
                    : "No companies found"}
                </strong>
                <p>
                  {companies.length === 0
                    ? "Registered companies will appear here."
                    : "Try selecting a different status filter."}
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
                    {filteredCompanies.map((company) => {
                      const canReview = canReviewCompany(company);

                      return (
                        <tr key={company.companyId}>
                          <td className="pm-company-name">
                            {company.companyName}
                          </td>

                          <td>{company.ownerName || "Not available"}</td>

                          <td>
                            {company.ownerEmail || company.companyEmail}
                          </td>

                          <td>{formatDate(company.createdAt)}</td>

                          <td>
                            <span
                              className={`pm-status ${getStatusClass(company)}`}
                            >
                              {getDisplayStatus(company)}
                            </span>
                          </td>

                          <td>
                            <div className="pm-company-actions">
                              <button
                                type="button"
                                className="pm-action-button pm-view-action"
                                title="View company"
                                onClick={() => setSelectedCompany(company)}
                              >
                                <Eye size={16} />
                              </button>

                              {canReview && (
                                <>
                                  <button
                                    type="button"
                                    className="pm-action-button pm-activate-action"
                                    title="Approve company"
                                    disabled={actionLoading !== null}
                                    onClick={() =>
                                      handleCompanyAction(company, "approve")
                                    }
                                  >
                                    {actionLoading ===
                                    `${company.companyId}-approve` ? (
                                      <LoaderCircle size={16} />
                                    ) : (
                                      <CheckCircle2 size={16} />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    className="pm-action-button pm-delete-action"
                                    title="Reject company"
                                    disabled={actionLoading !== null}
                                    onClick={() =>
                                      handleCompanyAction(company, "reject")
                                    }
                                  >
                                    {actionLoading ===
                                    `${company.companyId}-reject` ? (
                                      <LoaderCircle size={16} />
                                    ) : (
                                      <XCircle size={16} />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="pm-demo-note">
            <ShieldCheck size={16} />
            Company information is loaded directly from the OrgConnect backend.
          </div>
        </div>
      </main>

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
                <p>Registered organization information</p>
              </div>

              <button
                type="button"
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

              <h3>{selectedCompany.companyName}</h3>

              <span
                className={`pm-status ${getStatusClass(selectedCompany)}`}
              >
                {getDisplayStatus(selectedCompany)}
              </span>

              <div className="pm-detail-row">
                <User size={18} />
                <div>
                  <small>Company Owner</small>
                  <strong>
                    {selectedCompany.ownerName || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <Mail size={18} />
                <div>
                  <small>Owner Email</small>
                  <strong>
                    {selectedCompany.ownerEmail || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <Phone size={18} />
                <div>
                  <small>Owner Mobile</small>
                  <strong>
                    {selectedCompany.ownerMobileNumber || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <CalendarDays size={18} />
                <div>
                  <small>Registration Date</small>
                  <strong>{formatDate(selectedCompany.createdAt)}</strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <Building2 size={18} />
                <div>
                  <small>Registration Number</small>
                  <strong>
                    {selectedCompany.registrationNumber || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <MapPin size={18} />
                <div>
                  <small>Company Address</small>
                  <strong>
                    {[
                      selectedCompany.companyAddress,
                      selectedCompany.city,
                      selectedCompany.state,
                      selectedCompany.country,
                      selectedCompany.pinCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not available"}
                  </strong>
                </div>
              </div>

              <div className="pm-detail-row">
                <ShieldCheck size={18} />
                <div>
                  <small>Owner Email Verification</small>
                  <strong>
                    {selectedCompany.ownerEmailVerified
                      ? "Verified"
                      : "Not verified"}
                  </strong>
                </div>
              </div>

              {normalizeStatus(selectedCompany.companyStatus) === "ACTIVE" &&
                !selectedCompany.ownerEmailVerified && (
                  <div className="pm-review-notice">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Requires Review</strong>
                      <p>
                        This company is marked ACTIVE, but its owner's email
                        is not verified. It is not counted as approved and
                        cannot be approved through this dashboard.
                      </p>
                    </div>
                  </div>
                )}

              {isPendingApproval(selectedCompany) &&
                !selectedCompany.ownerEmailVerified && (
                  <div className="pm-review-notice">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Email Verification Required</strong>
                      <p>
                        The owner must verify their email before this company
                        can be approved.
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {canReviewCompany(selectedCompany) && (
              <div className="pm-confirm-actions">
                <button
                  type="button"
                  className="pm-cancel-button"
                  onClick={() =>
                    handleCompanyAction(selectedCompany, "reject")
                  }
                  disabled={actionLoading !== null}
                >
                  <XCircle size={16} />
                  Reject
                </button>

                <button
                  type="button"
                  className="pm-modal-done"
                  onClick={() =>
                    handleCompanyAction(selectedCompany, "approve")
                  }
                  disabled={actionLoading !== null}
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
              </div>
            )}

            {!canReviewCompany(selectedCompany) && (
              <button
                type="button"
                className="pm-modal-done"
                onClick={() => setSelectedCompany(null)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
