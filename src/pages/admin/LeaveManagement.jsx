
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  RefreshCw,
} from "lucide-react";

import leaveService from "../../services/leaveService";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        statusFilter === "ALL"
          ? await leaveService.getAllLeaves()
          : await leaveService.getLeavesByStatus(statusFilter);

      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const filteredLeaves = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return leaves;

    return leaves.filter((leave) =>
      [
        leave.employeeName,
        leave.employeeId,
        leave.leaveType,
        leave.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [leaves, search]);

  const counts = {
    total: leaves.length,
    pending: leaves.filter(
      (leave) => leave.status?.toUpperCase() === "PENDING"
    ).length,
    approved: leaves.filter(
      (leave) => leave.status?.toUpperCase() === "APPROVED"
    ).length,
    rejected: leaves.filter(
      (leave) => leave.status?.toUpperCase() === "REJECTED"
    ).length,
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleDecision = async (decision) => {
    if (!selectedLeave) return;

    try {
      setProcessing(true);
      setError("");

      if (decision === "APPROVED") {
        await leaveService.approveLeave(
          selectedLeave.id,
          remarks
        );
      } else {
        await leaveService.rejectLeave(
          selectedLeave.id,
          remarks
        );
      }

      setSelectedLeave(null);
      setRemarks("");

      await loadLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${decision.toLowerCase()} leave request.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    background: "var(--card, white)",
    border: "1px solid var(--border, #e7e9f0)",
    borderRadius: "12px",
    padding: "18px",
  };

  const statusStyle = (status) => {
    const colors = {
      PENDING: {
        color: "#b7791f",
        background: "#fff7df",
      },
      APPROVED: {
        color: "#16804a",
        background: "#e5f7ed",
      },
      REJECTED: {
        color: "#c53030",
        background: "#fde8e8",
      },
    };

    return {
      display: "inline-block",
      padding: "5px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      ...colors[status?.toUpperCase()] || colors.PENDING,
    };
  };

  const buttonStyle = {
    border: "1px solid var(--border, #e7e9f0)",
    borderRadius: "7px",
    padding: "9px 13px",
    cursor: "pointer",
    background: "var(--card, white)",
    color: "var(--text, #202536)",
    fontSize: "13px",
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "24px",
        color: "var(--text, #202536)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "25px" }}>
            Leave Management
          </h2>
          <p style={{ margin: 0, color: "var(--muted, #7a8192)" }}>
            Review and manage employee leave requests.
          </p>
        </div>

        <button
          style={buttonStyle}
          onClick={loadLeaves}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={{ verticalAlign: "middle", marginRight: "6px" }}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "8px",
            background: "#fde8e8",
            color: "#c53030",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        {[
          { label: "Total Requests", value: counts.total, icon: CalendarDays },
          { label: "Pending", value: counts.pending, icon: Clock },
          { label: "Approved", value: counts.approved, icon: CheckCircle },
          { label: "Rejected", value: counts.rejected, icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--muted, #7a8192)",
                    fontSize: "13px",
                  }}
                >
                  {item.label}
                </span>
                <Icon size={19} color="var(--muted, #7a8192)" />
              </div>

              <h3 style={{ fontSize: "25px", margin: "12px 0 0" }}>
                {item.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: "18px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: "1 1 220px",
            position: "relative",
          }}
        >
          <Search
            size={17}
            style={{
              position: "absolute",
              left: "12px",
              top: "12px",
              color: "var(--muted, #7a8192)",
            }}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, ID or leave type..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px 11px 38px",
              border: "1px solid var(--border, #e7e9f0)",
              borderRadius: "7px",
              background: "var(--card, white)",
              color: "var(--text, #202536)",
              outline: "none",
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "11px",
            borderRadius: "7px",
            border: "1px solid var(--border, #e7e9f0)",
            background: "var(--card, white)",
            color: "var(--text, #202536)",
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "45px", textAlign: "center" }}>
            Loading leave requests...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div
            style={{
              minHeight: "230px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "25px",
            }}
          >
            <CalendarDays
              size={40}
              color="var(--muted, #7a8192)"
            />
            <h3>No Leave Requests Found</h3>
            <p
              style={{
                color: "var(--muted, #7a8192)",
                fontSize: "13px",
              }}
            >
              Leave requests will appear here when employees submit them.
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "850px",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "var(--surface, #f8f9fc)" }}>
                {[
                  "Employee",
                  "Leave Type",
                  "Duration",
                  "Days",
                  "Applied On",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderBottom: "1px solid var(--border, #e7e9f0)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)" }}>
                    <strong>{leave.employeeName || "Unknown"}</strong>
                    <div style={{ color: "var(--muted, #7a8192)", marginTop: "4px" }}>
                      ID: {leave.employeeId}
                    </div>
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)" }}>
                    {leave.leaveType}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)", whiteSpace: "nowrap" }}>
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)" }}>
                    {leave.days}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)", whiteSpace: "nowrap" }}>
                    {formatDate(leave.appliedOn)}
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)" }}>
                    <span style={statusStyle(leave.status)}>
                      {leave.status}
                    </span>
                  </td>

                  <td style={{ padding: "14px", borderBottom: "1px solid var(--border, #e7e9f0)" }}>
                    <button
                      style={buttonStyle}
                      onClick={() => {
                        setSelectedLeave(leave);
                        setRemarks("");
                      }}
                    >
                      <Eye size={14} style={{ verticalAlign: "middle", marginRight: "5px" }} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedLeave && (
        <div
          onClick={() => !processing && setSelectedLeave(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--card, white)",
              borderRadius: "12px",
              padding: "24px",
              color: "var(--text, #202536)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>Leave Request Details</h3>
              <button
                style={buttonStyle}
                disabled={processing}
                onClick={() => setSelectedLeave(null)}
              >
                <X size={16} />
              </button>
            </div>

            {[
              ["Employee", selectedLeave.employeeName],
              ["Employee ID", selectedLeave.employeeId],
              ["Leave Type", selectedLeave.leaveType],
              ["Start Date", formatDate(selectedLeave.startDate)],
              ["End Date", formatDate(selectedLeave.endDate)],
              ["Total Days", selectedLeave.days],
              ["Applied On", formatDate(selectedLeave.appliedOn)],
              ["Status", selectedLeave.status],
              ["Reason", selectedLeave.reason],
              ["Admin Remarks", selectedLeave.adminRemarks || "-"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 1fr",
                  gap: "10px",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border, #e7e9f0)",
                  fontSize: "13px",
                }}
              >
                <strong>{label}</strong>
                <span style={{ overflowWrap: "anywhere" }}>
                  {value ?? "-"}
                </span>
              </div>
            ))}

            {selectedLeave.status?.toUpperCase() === "PENDING" && (
              <>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: "20px 0 8px",
                  }}
                >
                  Admin Remarks (Optional)
                </label>

                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Enter remarks..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px",
                    border: "1px solid var(--border, #e7e9f0)",
                    borderRadius: "7px",
                    background: "var(--card, white)",
                    color: "var(--text, #202536)",
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    disabled={processing}
                    onClick={() => handleDecision("REJECTED")}
                    style={{
                      ...buttonStyle,
                      background: "#c53030",
                      color: "white",
                      border: "none",
                    }}
                  >
                    <XCircle size={14} style={{ verticalAlign: "middle", marginRight: "5px" }} />
                    Reject
                  </button>

                  <button
                    disabled={processing}
                    onClick={() => handleDecision("APPROVED")}
                    style={{
                      ...buttonStyle,
                      background: "#16804a",
                      color: "white",
                      border: "none",
                    }}
                  >
                    <CheckCircle size={14} style={{ verticalAlign: "middle", marginRight: "5px" }} />
                    Approve
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
