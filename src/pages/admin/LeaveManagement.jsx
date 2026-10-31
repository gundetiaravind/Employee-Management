
import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";

const initialRequests = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    leaveType: "Casual Leave",
    fromDate: "2026-11-02",
    toDate: "2026-11-03",
    days: 2,
    appliedOn: "2026-10-28",
    reason: "Personal work.",
    status: "Pending",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Reddy",
    department: "Human Resources",
    leaveType: "Sick Leave",
    fromDate: "2026-10-29",
    toDate: "2026-10-30",
    days: 2,
    appliedOn: "2026-10-28",
    reason: "Not feeling well.",
    status: "Approved",
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Arjun Kumar",
    department: "Finance",
    leaveType: "Earned Leave",
    fromDate: "2026-11-05",
    toDate: "2026-11-08",
    days: 4,
    appliedOn: "2026-10-25",
    reason: "Family function.",
    status: "Rejected",
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Rao",
    department: "Engineering",
    leaveType: "Casual Leave",
    fromDate: "2026-11-10",
    toDate: "2026-11-10",
    days: 1,
    appliedOn: "2026-10-30",
    reason: "Personal appointment.",
    status: "Pending",
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Kiran Reddy",
    department: "Marketing",
    leaveType: "Sick Leave",
    fromDate: "2026-10-20",
    toDate: "2026-10-21",
    days: 2,
    appliedOn: "2026-10-19",
    reason: "Medical rest.",
    status: "Approved",
  },
];

const departments = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
];

const statusClass = (status) => {
  if (status === "Approved") return "leave-approved";
  if (status === "Rejected") return "leave-rejected";
  return "leave-pending";
};

export default function LeaveManagement() {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const value = search.toLowerCase();

      const matchesSearch =
        request.employeeName.toLowerCase().includes(value) ||
        request.employeeId.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        request.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [requests, search, statusFilter, departmentFilter]);

  const updateRequestStatus = (id, status) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    setSelectedRequest((previous) =>
      previous?.id === id ? { ...previous, status } : previous
    );
  };

  const summaryCards = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: CalendarDays,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "#b7791f",
      background: "#fff4df",
    },
    {
      label: "Approved Requests",
      value: approvedCount,
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Rejected Requests",
      value: rejectedCount,
      icon: XCircle,
      color: "#c43d3d",
      background: "#fceaea",
    },
  ];

  return (
    <div className="leave-page">
      <style>{`
        .leave-page {
          width: 100%;
          color: var(--text, #202536);
        }

        .leave-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          color: var(--muted, #7a8192);
          font-size: 14px;
        }

        .leave-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .leave-summary-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .leave-summary-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .leave-summary-label {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .leave-summary-value {
          margin-top: 5px;
          font-size: 24px;
          font-weight: 700;
        }

        .leave-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 17px;
        }

        .leave-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .leave-search svg {
          position: absolute;
          top: 50%;
          left: 13px;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .leave-input,
        .leave-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .leave-search .leave-input {
          padding-left: 40px;
        }

        .leave-filter {
          width: 180px;
        }

        .leave-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .leave-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .leave-table th,
        .leave-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .leave-table th {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-weight: 600;
        }

        .leave-table tbody tr:last-child td {
          border-bottom: none;
        }

        .leave-employee {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .leave-muted {
          color: var(--muted, #7a8192);
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

        .leave-approved {
          background: #e7f8ef;
          color: #16834b;
        }

        .leave-rejected {
          background: #fceaea;
          color: #c43d3d;
        }

        .leave-pending {
          background: #fff4df;
          color: #a76b12;
        }

        .leave-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .leave-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 9px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 7px;
          background: var(--card, white);
          color: var(--text, #202536);
          cursor: pointer;
          font-size: 12px;
        }

        .leave-action-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .leave-action-btn.view:hover {
          color: var(--primary, #6558d3);
        }

        .leave-action-btn.approve {
          color: #16834b;
        }

        .leave-action-btn.reject {
          color: #c43d3d;
        }

        .leave-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }

        .leave-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, .45);
        }

        .leave-modal {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 14px;
          background: var(--card, white);
          color: var(--text, #202536);
        }

        .leave-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .leave-modal-header h3 {
          margin: 0;
        }

        .leave-detail {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border, #e7e9f0);
          font-size: 14px;
        }

        .leave-detail span:first-child {
          color: var(--muted, #7a8192);
        }

        .leave-reason {
          margin-top: 18px;
          padding: 14px;
          border-radius: 9px;
          background: var(--bg, #f6f7fb);
          font-size: 14px;
          line-height: 1.6;
        }

        @media (max-width: 950px) {
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
        }
      `}</style>

      <div className="leave-heading">
        <div>
          <h2>Leave Management</h2>
          <p>Review and manage employee leave requests.</p>
        </div>
      </div>

      <div className="leave-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="leave-summary-card" key={card.label}>
              <div
                className="leave-summary-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="leave-summary-label">{card.label}</div>
                <div className="leave-summary-value">{card.value}</div>
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
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="leave-select leave-filter"
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="All">All Departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

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
              <th>Employee</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="leave-employee">
                      {request.employeeName}
                    </div>
                    <div className="leave-muted">
                      {request.employeeId}
                    </div>
                  </td>

                  <td>{request.department}</td>
                  <td>{request.leaveType}</td>
                  <td>{request.fromDate}</td>
                  <td>{request.toDate}</td>
                  <td>{request.days}</td>
                  <td>{request.appliedOn}</td>

                  <td>
                    <span
                      className={`leave-status ${statusClass(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </td>

                  <td>
                    <div className="leave-actions">
                      <button
                        className="leave-action-btn view"
                        title="View details"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="leave-action-btn approve"
                        title="Approve request"
                        disabled={request.status !== "Pending"}
                        onClick={() =>
                          updateRequestStatus(request.id, "Approved")
                        }
                      >
                        <CheckCircle size={15} />
                      </button>

                      <button
                        className="leave-action-btn reject"
                        title="Reject request"
                        disabled={request.status !== "Pending"}
                        onClick={() =>
                          updateRequestStatus(request.id, "Rejected")
                        }
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="leave-empty">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div
          className="leave-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="leave-modal">
            <div className="leave-modal-header">
              <h3>Leave Request Details</h3>

              <button
                className="leave-action-btn"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="leave-detail">
              <span>Employee</span>
              <strong>{selectedRequest.employeeName}</strong>
            </div>

            <div className="leave-detail">
              <span>Employee ID</span>
              <strong>{selectedRequest.employeeId}</strong>
            </div>

            <div className="leave-detail">
              <span>Department</span>
              <strong>{selectedRequest.department}</strong>
            </div>

            <div className="leave-detail">
              <span>Leave Type</span>
              <strong>{selectedRequest.leaveType}</strong>
            </div>

            <div className="leave-detail">
              <span>Duration</span>
              <strong>
                {selectedRequest.fromDate} to {selectedRequest.toDate}
              </strong>
            </div>

            <div className="leave-detail">
              <span>Total Days</span>
              <strong>{selectedRequest.days}</strong>
            </div>

            <div className="leave-detail">
              <span>Status</span>
              <span
                className={`leave-status ${statusClass(selectedRequest.status)}`}
              >
                {selectedRequest.status}
              </span>
            </div>

            <div className="leave-reason">
              <strong>Reason</strong>
              <p>{selectedRequest.reason}</p>
            </div>

            {selectedRequest.status === "Pending" && (
              <div className="leave-actions" style={{ marginTop: 20 }}>
                <button
                  className="leave-action-btn approve"
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Approved")
                  }
                >
                  <CheckCircle size={15} />
                  Approve
                </button>

                <button
                  className="leave-action-btn reject"
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, "Rejected")
                  }
                >
                  <XCircle size={15} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
