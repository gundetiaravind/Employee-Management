
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const initialAttendance = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Rahul Sharma",
    department: "Engineering",
    date: "2026-10-31",
    checkIn: "09:05 AM",
    checkOut: "06:10 PM",
    status: "Present",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Priya Reddy",
    department: "Human Resources",
    date: "2026-10-31",
    checkIn: "09:30 AM",
    checkOut: "06:00 PM",
    status: "Late",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Arjun Kumar",
    department: "Finance",
    date: "2026-10-31",
    checkIn: "--",
    checkOut: "--",
    status: "Absent",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Sneha Rao",
    department: "Engineering",
    date: "2026-10-31",
    checkIn: "--",
    checkOut: "--",
    status: "On Leave",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Kiran Reddy",
    department: "Marketing",
    date: "2026-10-31",
    checkIn: "08:55 AM",
    checkOut: "06:15 PM",
    status: "Present",
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

const statusOptions = ["Present", "Absent", "Late", "On Leave"];

export default function Attendance() {
  const [records, setRecords] = useState(initialAttendance);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("2026-10-31");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        record.name.toLowerCase().includes(searchValue) ||
        record.employeeId.toLowerCase().includes(searchValue);

      const matchesDate =
        !dateFilter || record.date === dateFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        record.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [records, search, dateFilter, departmentFilter, statusFilter]);

  const presentCount = filteredRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = filteredRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const lateCount = filteredRecords.filter(
    (record) => record.status === "Late"
  ).length;

  const leaveCount = filteredRecords.filter(
    (record) => record.status === "On Leave"
  ).length;

  const updateStatus = (id, status) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, status } : record
      )
    );
  };

  const exportCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Date",
      "Check In",
      "Check Out",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.employeeId,
      record.name,
      record.department,
      record.date,
      record.checkIn,
      record.checkOut,
      record.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

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
    link.download = "attendance-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Present",
      value: presentCount,
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Absent",
      value: absentCount,
      icon: XCircle,
      color: "#c43d3d",
      background: "#fceaea",
    },
    {
      label: "Late",
      value: lateCount,
      icon: Clock,
      color: "#c17b17",
      background: "#fff4df",
    },
    {
      label: "On Leave",
      value: leaveCount,
      icon: CalendarDays,
      color: "#6558d3",
      background: "#efedff",
    },
  ];

  return (
    <div className="att-page">
      <style>{`
        .att-page {
          width: 100%;
          color: var(--text, #202536);
        }

        .att-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .att-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .att-heading p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 14px;
        }

        .att-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border: none;
          border-radius: 8px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .att-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .att-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .att-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          border-radius: 10px;
        }

        .att-card-label {
          color: var(--muted, #7a8192);
          font-size: 13px;
        }

        .att-card-value {
          margin-top: 5px;
          font-size: 24px;
          font-weight: 700;
        }

        .att-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .att-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .att-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .att-input,
        .att-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .att-search .att-input {
          padding-left: 40px;
        }

        .att-filter {
          width: 175px;
        }

        .att-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .att-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .att-table th,
        .att-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .att-table th {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-weight: 600;
        }

        .att-table tbody tr:last-child td {
          border-bottom: none;
        }

        .att-employee {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .att-muted {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .att-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .att-present {
          background: #e7f8ef;
          color: #16834b;
        }

        .att-absent {
          background: #fceaea;
          color: #c43d3d;
        }

        .att-late {
          background: #fff4df;
          color: #a76b12;
        }

        .att-on-leave {
          background: #efedff;
          color: #6558d3;
        }

        .att-status-select {
          min-width: 125px;
          padding: 7px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 7px;
          background: var(--card, white);
          color: var(--text, #202536);
        }

        .att-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }

        @media (max-width: 900px) {
          .att-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .att-summary {
            grid-template-columns: 1fr;
          }

          .att-filter {
            width: 100%;
          }
        }
      `}</style>

      <div className="att-heading">
        <div>
          <h2>Attendance Management</h2>
          <p>Monitor and manage employee attendance records.</p>
        </div>

        <button className="att-export" onClick={exportCSV}>
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="att-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="att-card" key={card.label}>
              <div
                className="att-card-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="att-card-label">{card.label}</div>
                <div className="att-card-value">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="att-toolbar">
        <div className="att-search">
          <Search size={17} />
          <input
            className="att-input"
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <input
          className="att-input att-filter"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filter by date"
        />

        <select
          className="att-select att-filter"
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
          className="att-select att-filter"
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

      <div className="att-table-wrap">
        <table className="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="att-employee">{record.name}</div>
                  </td>
                  <td>{record.employeeId}</td>
                  <td>{record.department}</td>
                  <td>{record.date}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>
                    <span
                      className={`att-status att-${record.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="att-status-select"
                      value={record.status}
                      onChange={(event) =>
                        updateStatus(record.id, event.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="att-empty">
                  <Users size={25} />
                  <p>No attendance records found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
