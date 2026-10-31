
import { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Users,
  CalendarDays,
  Wallet,
  ClipboardList,
  Printer,
} from "lucide-react";

const reportData = [
  {
    id: 1,
    employee: "Rahul Sharma",
    employeeId: "EMP001",
    department: "Engineering",
    attendance: "Present",
    leave: "Approved",
    payroll: 45000,
    month: "2026-10",
  },
  {
    id: 2,
    employee: "Priya Reddy",
    employeeId: "EMP002",
    department: "Human Resources",
    attendance: "Present",
    leave: "Pending",
    payroll: 52000,
    month: "2026-10",
  },
  {
    id: 3,
    employee: "Arjun Kumar",
    employeeId: "EMP003",
    department: "Finance",
    attendance: "Late",
    leave: "Rejected",
    payroll: 48000,
    month: "2026-10",
  },
  {
    id: 4,
    employee: "Sneha Patel",
    employeeId: "EMP004",
    department: "Marketing",
    attendance: "Absent",
    leave: "Approved",
    payroll: 42000,
    month: "2026-10",
  },
  {
    id: 5,
    employee: "Vikram Rao",
    employeeId: "EMP005",
    department: "Engineering",
    attendance: "Present",
    leave: "None",
    payroll: 60000,
    month: "2026-10",
  },
  {
    id: 6,
    employee: "Ananya Das",
    employeeId: "EMP006",
    department: "Finance",
    attendance: "Present",
    leave: "Pending",
    payroll: 46000,
    month: "2026-10",
  },
];

const reportTypes = [
  {
    id: "employees",
    title: "Employee Report",
    description: "Employee directory and department-wise employee details.",
    icon: Users,
  },
  {
    id: "attendance",
    title: "Attendance Report",
    description: "Present, absent, late and attendance records.",
    icon: CalendarDays,
  },
  {
    id: "leave",
    title: "Leave Report",
    description: "Approved, pending and rejected leave requests.",
    icon: ClipboardList,
  },
  {
    id: "payroll",
    title: "Payroll Report",
    description: "Salary details and monthly payroll summary.",
    icon: Wallet,
  },
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Reports() {
  const [reportType, setReportType] = useState("employees");
  const [month, setMonth] = useState("2026-10");
  const [department, setDepartment] = useState("All");

  const departments = [
    "All",
    ...new Set(reportData.map((item) => item.department)),
  ];

  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const matchesMonth = item.month === month;
      const matchesDepartment =
        department === "All" || item.department === department;

      return matchesMonth && matchesDepartment;
    });
  }, [month, department]);

  const summary = useMemo(() => ({
    employees: filteredData.length,
    present: filteredData.filter(
      (item) => item.attendance === "Present"
    ).length,
    absent: filteredData.filter(
      (item) => item.attendance === "Absent"
    ).length,
    late: filteredData.filter(
      (item) => item.attendance === "Late"
    ).length,
    approvedLeaves: filteredData.filter(
      (item) => item.leave === "Approved"
    ).length,
    pendingLeaves: filteredData.filter(
      (item) => item.leave === "Pending"
    ).length,
    payroll: filteredData.reduce(
      (total, item) => total + item.payroll,
      0
    ),
  }), [filteredData]);

  const exportCSV = () => {
    const headers = [
      "Employee ID",
      "Employee",
      "Department",
      "Attendance",
      "Leave Status",
      "Monthly Salary",
    ];

    const rows = filteredData.map((item) => [
      item.employeeId,
      item.employee,
      item.department,
      item.attendance,
      item.leave,
      item.payroll,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replaceAll('"', '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `orgconnect-${reportType}-report-${month}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const activeReport = reportTypes.find(
    (item) => item.id === reportType
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="report-stat">
      <div className="report-stat-icon" style={{ color }}>
        <Icon size={21} />
      </div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="admin-reports">
      <style>{`
        .admin-reports {
          color: var(--text, #202536);
          width: 100%;
        }

        .reports-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .reports-heading h1 {
          font-size: 26px;
          margin: 0 0 7px;
        }

        .reports-heading p {
          color: var(--muted, #7a8192);
          margin: 0;
          font-size: 14px;
        }

        .reports-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 9px;
          padding: 11px 16px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .reports-btn.secondary {
          background: var(--card, #fff);
          color: var(--text, #202536);
          border: 1px solid var(--border, #e7e9f0);
        }

        .report-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          padding: 18px;
          background: var(--card, #fff);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 13px;
          margin-bottom: 22px;
        }

        .report-filter {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 180px;
          flex: 1;
        }

        .report-filter label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted, #7a8192);
        }

        .report-filter select,
        .report-filter input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--bg, #fff);
          color: var(--text, #202536);
          outline: none;
        }

        .report-types {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .report-type {
          text-align: left;
          padding: 18px;
          border: 1px solid var(--border, #e7e9f0);
          background: var(--card, #fff);
          color: var(--text, #202536);
          border-radius: 12px;
          cursor: pointer;
          transition: .2s;
        }

        .report-type.active {
          border: 2px solid var(--primary, #6558d3);
          background: var(--soft-primary, #efedff);
        }

        .report-type-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
          margin-bottom: 13px;
        }

        .report-type strong {
          display: block;
          font-size: 14px;
          margin-bottom: 7px;
        }

        .report-type small {
          color: var(--muted, #7a8192);
          font-size: 12px;
          line-height: 1.5;
        }

        .report-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .report-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          background: var(--card, #fff);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          min-width: 0;
        }

        .report-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          background: var(--soft-primary, #efedff);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .report-stat p {
          color: var(--muted, #7a8192);
          font-size: 12px;
          margin: 0 0 6px;
        }

        .report-stat h3 {
          font-size: 20px;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .report-table-card {
          background: var(--card, #fff);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 13px;
          overflow: hidden;
        }

        .report-table-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 19px;
          border-bottom: 1px solid var(--border, #e7e9f0);
        }

        .report-table-heading h2 {
          font-size: 17px;
          margin: 0 0 5px;
        }

        .report-table-heading p {
          font-size: 12px;
          color: var(--muted, #7a8192);
          margin: 0;
        }

        .report-table-wrap {
          overflow-x: auto;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        .report-table th,
        .report-table td {
          padding: 14px 17px;
          text-align: left;
          border-bottom: 1px solid var(--border, #e7e9f0);
          font-size: 13px;
          white-space: nowrap;
        }

        .report-table th {
          color: var(--muted, #7a8192);
          background: var(--bg, #f6f7fb);
          font-weight: 600;
        }

        .report-table tr:last-child td {
          border-bottom: 0;
        }

        .report-status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
        }

        .report-empty {
          text-align: center !important;
          padding: 35px !important;
          color: var(--muted, #7a8192);
        }

        .report-note {
          margin-top: 16px;
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        @media (max-width: 1050px) {
          .report-types {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .report-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .reports-heading h1 {
            font-size: 22px;
          }

          .report-types,
          .report-stats {
            grid-template-columns: 1fr;
          }

          .report-filters {
            padding: 14px;
          }
        }

        @media print {
          .reports-heading button,
          .report-filters,
          .report-types,
          .report-table-heading button {
            display: none !important;
          }

          .admin-reports {
            color: #111 !important;
          }

          .report-table-card,
          .report-stat {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="reports-heading">
        <div>
          <h1>Reports</h1>
          <p>View and export your company's workforce reports.</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="reports-btn secondary"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Print
          </button>

          <button className="reports-btn" onClick={exportCSV}>
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="report-filters">
        <div className="report-filter">
          <label>Report month</label>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>

        <div className="report-filter">
          <label>Department</label>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            {departments.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="report-types">
        {reportTypes.map((report) => {
          const Icon = report.icon;

          return (
            <button
              key={report.id}
              className={`report-type ${reportType === report.id ? "active" : ""}`}
              onClick={() => setReportType(report.id)}
            >
              <div className="report-type-icon">
                <Icon size={20} />
              </div>
              <strong>{report.title}</strong>
              <small>{report.description}</small>
            </button>
          );
        })}
      </div>

      <div className="report-stats">
        {reportType === "employees" && (
          <>
            <StatCard icon={Users} label="Total Employees" value={summary.employees} color="#6558d3" />
            <StatCard icon={BarChart3} label="Departments" value={new Set(filteredData.map((item) => item.department)).size} color="#238b72" />
            <StatCard icon={CalendarDays} label="Present Today" value={summary.present} color="#238b72" />
            <StatCard icon={FileText} label="Monthly Payroll" value={currency(summary.payroll)} color="#c1842c" />
          </>
        )}

        {reportType === "attendance" && (
          <>
            <StatCard icon={Users} label="Employees" value={summary.employees} color="#6558d3" />
            <StatCard icon={CalendarDays} label="Present" value={summary.present} color="#238b72" />
            <StatCard icon={CalendarDays} label="Absent" value={summary.absent} color="#d04e55" />
            <StatCard icon={CalendarDays} label="Late" value={summary.late} color="#c1842c" />
          </>
        )}

        {reportType === "leave" && (
          <>
            <StatCard icon={ClipboardList} label="Total Employees" value={summary.employees} color="#6558d3" />
            <StatCard icon={CalendarDays} label="Approved" value={summary.approvedLeaves} color="#238b72" />
            <StatCard icon={CalendarDays} label="Pending" value={summary.pendingLeaves} color="#c1842c" />
            <StatCard icon={CalendarDays} label="Rejected" value={filteredData.filter((item) => item.leave === "Rejected").length} color="#d04e55" />
          </>
        )}

        {reportType === "payroll" && (
          <>
            <StatCard icon={Users} label="Employees" value={summary.employees} color="#6558d3" />
            <StatCard icon={Wallet} label="Total Payroll" value={currency(summary.payroll)} color="#238b72" />
            <StatCard icon={Wallet} label="Average Salary" value={currency(summary.employees ? summary.payroll / summary.employees : 0)} color="#c1842c" />
            <StatCard icon={FileText} label="Report Month" value={month || "—"} color="#6558d3" />
          </>
        )}
      </div>

      <div className="report-table-card">
        <div className="report-table-heading">
          <div>
            <h2>{activeReport?.title}</h2>
            <p>{filteredData.length} records found</p>
          </div>

          <button className="reports-btn secondary" onClick={exportCSV}>
            <Download size={16} />
            Download
          </button>
        </div>

        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee</th>
                <th>Department</th>
                {reportType === "employees" && <th>Monthly Salary</th>}
                {reportType === "attendance" && <th>Attendance</th>}
                {reportType === "leave" && <th>Leave Status</th>}
                {reportType === "payroll" && (
                  <>
                    <th>Attendance</th>
                    <th>Monthly Salary</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="report-empty">
                    No records found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.employeeId}</td>
                    <td><strong>{item.employee}</strong></td>
                    <td>{item.department}</td>

                    {reportType === "employees" && (
                      <td>{currency(item.payroll)}</td>
                    )}

                    {reportType === "attendance" && (
                      <td><span className="report-status">{item.attendance}</span></td>
                    )}

                    {reportType === "leave" && (
                      <td><span className="report-status">{item.leave}</span></td>
                    )}

                    {reportType === "payroll" && (
                      <>
                        <td><span className="report-status">{item.attendance}</span></td>
                        <td>{currency(item.payroll)}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="report-note">
        Demo data is currently displayed. Reports will use actual company records after backend integration.
      </p>
    </div>
  );
}
