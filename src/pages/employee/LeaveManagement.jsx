import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Send,
  BriefcaseBusiness,
} from "lucide-react";

const initialLeaves = [
  {
    id: 1,
    leaveType: "Casual Leave",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    days: 2,
    reason: "Personal work",
    appliedOn: "2026-10-05",
    status: "Approved",
  },
  {
    id: 2,
    leaveType: "Sick Leave",
    startDate: "2026-10-20",
    endDate: "2026-10-20",
    days: 1,
    reason: "Not feeling well",
    appliedOn: "2026-10-19",
    status: "Pending",
  },
  {
    id: 3,
    leaveType: "Earned Leave",
    startDate: "2026-09-15",
    endDate: "2026-09-16",
    days: 2,
    reason: "Family function",
    appliedOn: "2026-09-01",
    status: "Rejected",
  },
];

const leaveTypes = ["Casual Leave", "Sick Leave", "Earned Leave"];

const initialForm = {
  leaveType: "Casual Leave",
  startDate: "",
  endDate: "",
  reason: "",
};

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.floor((end - start) / 86400000) + 1;
}

function formatDate(date) {
  if (!date) return "--";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EmployeeLeaveManagement() {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredLeaves = useMemo(() => {
    const value = search.toLowerCase();

    return leaves.filter((leave) => {
      const matchesSearch =
        leave.leaveType.toLowerCase().includes(value) ||
        leave.reason.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const pendingCount = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === "Approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  const usedDays = leaves
    .filter((leave) => leave.status === "Approved")
    .reduce((total, leave) => total + leave.days, 0);

  const leaveBalance = Math.max(0, 12 - usedDays);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const submitLeave = (event) => {
    event.preventDefault();

    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError("Please complete all fields.");
      return;
    }

    if (form.startDate < new Date().toLocaleDateString("en-CA")) {
      setError("Leave start date cannot be in the past.");
      return;
    }

    const days = calculateDays(form.startDate, form.endDate);

    if (days <= 0) {
      setError("End date must be on or after the start date.");
      return;
    }

    const newLeave = {
      id: Date.now(),
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      days,
      reason: form.reason.trim(),
      appliedOn: new Date().toLocaleDateString("en-CA"),
      status: "Pending",
    };

    setLeaves((previous) => [newLeave, ...previous]);
    setForm(initialForm);
    setShowForm(false);
    setSuccess("Your leave application has been submitted.");
  };

  const cancelLeave = (id) => {
    setLeaves((previous) =>
      previous.filter((leave) => leave.id !== id)
    );
  };

  const summaryCards = [
    {
      label: "Available Leave Balance",
      value: leaveBalance,
      subtitle: "Days remaining",
      icon: CalendarDays,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Pending Requests",
      value: pendingCount,
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "#c17b17",
      background: "#fff4df",
    },
    {
      label: "Approved Requests",
      value: approvedCount,
      subtitle: "Approved applications",
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Rejected Requests",
      value: rejectedCount,
      subtitle: "Rejected applications",
      icon: XCircle,
      color: "#c43d3d",
      background: "#fceaea",
    },
  ];

  const getStatusClass = (status) =>
    status.toLowerCase();

  return (
    <div className="leave-page">
      <style>{`
        .leave-page {
          width: 100%;
          color: var(--emp-text, #202536);
        }

        .leave-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .leave-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .leave-heading p {
          margin: 0;
          color: var(--emp-muted, #7a8192);
          font-size: 14px;
        }

        .leave-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 17px;
          border: none;
          border-radius: 8px;
          background: #6558d3;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .leave-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .leave-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .leave-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .leave-card-label {
          color: var(--emp-muted, #7a8192);
          font-size: 13px;
        }

        .leave-card-value {
          margin-top: 5px;
          font-size: 24px;
          font-weight: 700;
        }

        .leave-card-subtitle {
          margin-top: 3px;
          color: var(--emp-muted, #7a8192);
          font-size: 11px;
        }

        .leave-message {
          padding: 12px 15px;
          margin-bottom: 18px;
          border-radius: 8px;
          background: #e7f8ef;
          color: #16834b;
          font-size: 13px;
        }

        .leave-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .leave-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .leave-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--emp-muted, #7a8192);
        }

        .leave-input,
        .leave-select,
        .leave-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: var(--emp-input, white);
          color: var(--emp-text, #202536);
          outline: none;
          font: inherit;
        }

        .leave-search .leave-input {
          padding-left: 40px;
        }

        .leave-filter {
          width: 190px;
        }

        .leave-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .leave-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .leave-table th,
        .leave-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .leave-table th {
          background: var(--emp-hover, #f6f7fb);
          color: var(--emp-muted, #7a8192);
          font-weight: 600;
        }

        .leave-table tbody tr:last-child td {
          border-bottom: none;
        }

        .leave-type {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .leave-muted {
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        .leave-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .leave-status.approved {
          background: #e7f8ef;
          color: #16834b;
        }

        .leave-status.pending {
          background: #fff4df;
          color: #a76b12;
        }

        .leave-status.rejected {
          background: #fceaea;
          color: #c43d3d;
        }

        .leave-cancel {
          padding: 7px 10px;
          border: 1px solid #e6a0a0;
          border-radius: 7px;
          background: transparent;
          color: #c43d3d;
          cursor: pointer;
          font-size: 12px;
        }

        .leave-cancel:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .leave-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--emp-muted, #7a8192);
        }

        .leave-form-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(15, 20, 35, 0.55);
        }

        .leave-form-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 14px;
          background: var(--emp-card, white);
          color: var(--emp-text, #202536);
        }

        .leave-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .leave-form-header h3 {
          margin: 0;
          font-size: 19px;
        }

        .leave-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--emp-text, #202536);
          cursor: pointer;
        }

        .leave-form-group {
          margin-bottom: 16px;
        }

        .leave-form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        .leave-date-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .leave-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .leave-form-error {
          margin-bottom: 14px;
          color: #c43d3d;
          font-size: 13px;
        }

        .leave-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .leave-secondary-btn {
          padding: 11px 16px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--emp-text, #202536);
          cursor: pointer;
        }

        .leave-demo-note {
          margin-top: 17px;
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .leave-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .leave-summary {
            grid-template-columns: 1fr;
          }

          .leave-filter {
            width: 100%;
          }

          .leave-date-grid {
            grid-template-columns: 1fr;
          }

          .leave-form-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="leave-heading">
        <div>
          <h2>Leave Management</h2>
          <p>Apply for leave and track your leave requests.</p>
        </div>

        <button
          className="leave-primary-btn"
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          <Plus size={17} />
          Apply for Leave
        </button>
      </div>

      {success && <div className="leave-message">{success}</div>}

      <div className="leave-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="leave-card" key={card.label}>
              <div
                className="leave-card-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="leave-card-label">{card.label}</div>
                <div className="leave-card-value">{card.value}</div>
                <div className="leave-card-subtitle">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="leave-toolbar">
        <div className="leave-search">
          <Search size={17} />
          <input
            className="leave-input"
            placeholder="Search leave type or reason..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="leave-select leave-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="leave-table-wrap">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    <div className="leave-type">{leave.leaveType}</div>
                  </td>
                  <td>{formatDate(leave.startDate)}</td>
                  <td>{formatDate(leave.endDate)}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>{formatDate(leave.appliedOn)}</td>
                  <td>
                    <span
                      className={`leave-status ${getStatusClass(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="leave-cancel"
                      disabled={leave.status !== "Pending"}
                      onClick={() => cancelLeave(leave.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="leave-empty">
                  <BriefcaseBusiness size={25} />
                  <p>No leave applications found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="leave-demo-note">
        Demo data: leave balances and applications are stored only in this
        page's current session. They are not connected to the backend.
      </p>

      {showForm && (
        <div
          className="leave-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
              setError("");
            }
          }}
        >
          <div
            className="leave-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-form-title"
          >
            <div className="leave-form-header">
              <h3 id="leave-form-title">Apply for Leave</h3>

              <button
                className="leave-close"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitLeave}>
              <div className="leave-form-group">
                <label htmlFor="leaveType">Leave Type</label>
                <select
                  id="leaveType"
                  name="leaveType"
                  className="leave-select"
                  value={form.leaveType}
                  onChange={updateForm}
                >
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="leave-date-grid">
                <div className="leave-form-group">
                  <label htmlFor="startDate">From Date</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="leave-input"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.startDate}
                    onChange={updateForm}
                    required
                  />
                </div>

                <div className="leave-form-group">
                  <label htmlFor="endDate">To Date</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="leave-input"
                    min={
                      form.startDate ||
                      new Date().toLocaleDateString("en-CA")
                    }
                    value={form.endDate}
                    onChange={updateForm}
                    required
                  />
                </div>
              </div>

              <div className="leave-form-group">
                <label htmlFor="reason">Reason for Leave</label>
                <textarea
                  id="reason"
                  name="reason"
                  className="leave-textarea"
                  placeholder="Enter the reason for your leave..."
                  value={form.reason}
                  onChange={updateForm}
                  maxLength={500}
                  required
                />
              </div>

              {error && <div className="leave-form-error">{error}</div>}

              <div className="leave-form-actions">
                <button
                  type="button"
                  className="leave-secondary-btn"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="leave-primary-btn">
                  <Send size={16} />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}