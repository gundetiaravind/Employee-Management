
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

const initialAttendance = [
  {
    id: 1,
    date: "2026-10-01",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    hours: "9h 00m",
    status: "Present",
  },
  {
    id: 2,
    date: "2026-10-02",
    checkIn: "09:15 AM",
    checkOut: "06:00 PM",
    hours: "8h 45m",
    status: "Late",
  },
  {
    id: 3,
    date: "2026-10-03",
    checkIn: "09:00 AM",
    checkOut: "01:00 PM",
    hours: "4h 00m",
    status: "Half Day",
  },
  {
    id: 4,
    date: "2026-10-05",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    hours: "9h 00m",
    status: "Present",
  },
  {
    id: 5,
    date: "2026-10-06",
    checkIn: "--",
    checkOut: "--",
    hours: "--",
    status: "Absent",
  },
  {
    id: 6,
    date: "2026-10-07",
    checkIn: "08:55 AM",
    checkOut: "06:05 PM",
    hours: "9h 10m",
    status: "Present",
  },
  {
    id: 7,
    date: "2026-10-08",
    checkIn: "09:20 AM",
    checkOut: "06:00 PM",
    hours: "8h 40m",
    status: "Late",
  },
  {
    id: 8,
    date: "2026-10-09",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    hours: "9h 00m",
    status: "Present",
  },
  {
    id: 9,
    date: "2026-10-10",
    checkIn: "09:00 AM",
    checkOut: "01:00 PM",
    hours: "4h 00m",
    status: "Half Day",
  },
  {
    id: 10,
    date: "2026-10-12",
    checkIn: "--",
    checkOut: "--",
    hours: "--",
    status: "Absent",
  },
  {
    id: 11,
    date: "2026-10-13",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    hours: "9h 00m",
    status: "Present",
  },
  {
    id: 12,
    date: "2026-10-14",
    checkIn: "09:10 AM",
    checkOut: "06:00 PM",
    hours: "8h 50m",
    status: "Late",
  },
];

const statusOptions = ["Present", "Absent", "Late", "Half Day"];

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const statusClasses = {
    Present: "attendance-present",
    Absent: "attendance-absent",
    Late: "attendance-late",
    "Half Day": "attendance-half-day",
  };

  const icons = {
    Present: CheckCircle,
    Absent: XCircle,
    Late: AlertCircle,
    "Half Day": Timer,
  };

  const Icon = icons[status] || Clock;

  return (
    <span className={`attendance-status ${statusClasses[status] || ""}`}>
      <Icon size={14} />
      {status}
    </span>
  );
}

export default function MyAttendance() {
  const [records] = useState(initialAttendance);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("2026-10");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRecords = useMemo(() => {
    const searchValue = search.toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        record.date.toLowerCase().includes(searchValue) ||
        formatDate(record.date).toLowerCase().includes(searchValue);

      const matchesMonth =
        !monthFilter || record.date.startsWith(monthFilter);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [records, search, monthFilter, statusFilter]);

  const presentCount = filteredRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = filteredRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const lateCount = filteredRecords.filter(
    (record) => record.status === "Late"
  ).length;

  const halfDayCount = filteredRecords.filter(
    (record) => record.status === "Half Day"
  ).length;

  const totalDays = filteredRecords.length;

  const attendancePercentage =
    totalDays > 0
      ? Math.round(
          ((presentCount + lateCount + halfDayCount * 0.5) /
            totalDays) *
            100
        )
      : 0;

  const summaryCards = [
    {
      label: "Present Days",
      value: presentCount,
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Absent Days",
      value: absentCount,
      icon: XCircle,
      color: "#c43d3d",
      background: "#fceaea",
    },
    {
      label: "Late Arrivals",
      value: lateCount,
      icon: AlertCircle,
      color: "#c17b17",
      background: "#fff4df",
    },
    {
      label: "Half Days",
      value: halfDayCount,
      icon: Timer,
      color: "#6558d3",
      background: "#efedff",
    },
  ];

  const exportCSV = () => {
    const headers = [
      "Date",
      "Check In",
      "Check Out",
      "Working Hours",
      "Status",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((record) => [
      record.date,
      record.checkIn,
      record.checkOut,
      record.hours,
      record.status,
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "my-attendance.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-attendance-page">
      <style>{`
        .my-attendance-page {
          width: 100%;
          color: var(--emp-text, #202536);
        }

        .my-attendance-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .my-attendance-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .my-attendance-heading p {
          margin: 0;
          color: var(--emp-muted, #7a8192);
          font-size: 14px;
        }

        .my-attendance-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border: none;
          border-radius: 8px;
          background: #6558d3;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .my-attendance-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .my-attendance-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .my-attendance-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .my-attendance-card-label {
          color: var(--emp-muted, #7a8192);
          font-size: 13px;
        }

        .my-attendance-card-value {
          margin-top: 5px;
          font-size: 24px;
          font-weight: 700;
        }

        .my-attendance-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .my-attendance-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .my-attendance-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--emp-muted, #7a8192);
        }

        .my-attendance-input,
        .my-attendance-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: var(--emp-input, white);
          color: var(--emp-text, #202536);
          outline: none;
        }

        .my-attendance-search .my-attendance-input {
          padding-left: 40px;
        }

        .my-attendance-filter {
          width: 190px;
        }

        .my-attendance-progress {
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .my-attendance-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .my-attendance-progress-title {
          font-size: 14px;
          font-weight: 600;
        }

        .my-attendance-progress-value {
          font-size: 18px;
          font-weight: 700;
          color: #6558d3;
        }

        .my-attendance-progress-track {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: var(--emp-hover, #ececf3);
        }

        .my-attendance-progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #6558d3;
          transition: width 0.3s ease;
        }

        .my-attendance-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .my-attendance-table {
          width: 100%;
          min-width: 750px;
          border-collapse: collapse;
        }

        .my-attendance-table th,
        .my-attendance-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .my-attendance-table th {
          background: var(--emp-hover, #f6f7fb);
          color: var(--emp-muted, #7a8192);
          font-weight: 600;
        }

        .my-attendance-table tbody tr:last-child td {
          border-bottom: none;
        }

        .attendance-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .attendance-present {
          background: #e7f8ef;
          color: #16834b;
        }

        .attendance-absent {
          background: #fceaea;
          color: #c43d3d;
        }

        .attendance-late {
          background: #fff4df;
          color: #a76b12;
        }

        .attendance-half-day {
          background: #efedff;
          color: #6558d3;
        }

        .my-attendance-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--emp-muted, #7a8192);
        }

        .my-attendance-note {
          margin-top: 16px;
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        @media (max-width: 900px) {
          .my-attendance-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .my-attendance-summary {
            grid-template-columns: 1fr;
          }

          .my-attendance-filter {
            width: 100%;
          }
        }
      `}</style>

      <div className="my-attendance-heading">
        <div>
          <h2>My Attendance</h2>
          <p>View your daily attendance and working hours.</p>
        </div>

        <button
          className="my-attendance-export"
          onClick={exportCSV}
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="my-attendance-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="my-attendance-card" key={card.label}>
              <div
                className="my-attendance-card-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="my-attendance-card-label">
                  {card.label}
                </div>
                <div className="my-attendance-card-value">
                  {card.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-attendance-progress">
        <div className="my-attendance-progress-top">
          <span className="my-attendance-progress-title">
            Attendance Percentage
          </span>
          <span className="my-attendance-progress-value">
            {attendancePercentage}%
          </span>
        </div>

        <div className="my-attendance-progress-track">
          <div
            className="my-attendance-progress-fill"
            style={{ width: `${attendancePercentage}%` }}
          />
        </div>
      </div>

      <div className="my-attendance-toolbar">
        <div className="my-attendance-search">
          <Search size={17} />
          <input
            className="my-attendance-input"
            placeholder="Search by date..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <input
          className="my-attendance-input my-attendance-filter"
          type="month"
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
          aria-label="Filter by month"
        />

        <select
          className="my-attendance-select my-attendance-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="my-attendance-table-wrap">
        <table className="my-attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Working Hours</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.hours}</td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="my-attendance-empty">
                  <CalendarDays size={25} />
                  <p>No attendance records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="my-attendance-note">
        Demo data: These attendance records are sample records and are not
        connected to the backend.
      </p>
    </div>
  );
}
