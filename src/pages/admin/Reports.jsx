
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FileText,
  Users,
  CalendarDays,
  Wallet,
  ClipboardList,
  Printer,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import companyService from "../../services/companyService";
import payslipService from "../../services/payslipService";

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const reportTypes = [
  {
    id: "employees",
    title: "Employee Report",
    description: "Actual employee directory and department details.",
    icon: Users,
  },
  {
    id: "attendance",
    title: "Attendance Report",
    description: "Attendance records and daily summaries.",
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
    description: "Actual payslip upload records.",
    icon: Wallet,
  },
];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getPayslipPeriod = (item) => {
  if (!item.payslipMonth || !item.payslipYear) {
    return "Not specified";
  }

  return `${String(item.payslipMonth).padStart(2, "0")}/${item.payslipYear}`;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN");
};

export default function Reports() {
  const [reportType, setReportType] = useState("employees");
  const [month, setMonth] = useState(getCurrentMonth());
  const [department, setDepartment] = useState("All");

  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [error, setError] = useState("");
  const [payslipError, setPayslipError] = useState("");

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await companyService.getCompanyEmployees();

        if (active) {
          setEmployees(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Unable to load company employee records."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadPayslips = async () => {
      if (!employees.length) {
        setPayslips([]);
        return;
      }

      try {
        setPayslipLoading(true);
        setPayslipError("");

        const results = await Promise.allSettled(
          employees.map((employee) =>
            payslipService.getEmployeePayslips(employee.id)
          )
        );

        if (!active) return;

        const records = [];
        let failedRequests = 0;

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            if (Array.isArray(result.value)) {
              records.push(...result.value);
            }
          } else {
            failedRequests += 1;
          }
        });

        setPayslips(records);

        if (failedRequests > 0) {
          setPayslipError(
            `Payslip records could not be loaded for ${failedRequests} employee(s). The displayed records may be incomplete.`
          );
        }
      } catch {
        if (active) {
          setPayslipError("Unable to load payslip records.");
        }
      } finally {
        if (active) {
          setPayslipLoading(false);
        }
      }
    };

    loadPayslips();

    return () => {
      active = false;
    };
  }, [employees]);

  const departments = useMemo(() => {
    const values = employees
      .map((item) => item.department)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((item) =>
      department === "All" || item.department === department
    );
  }, [employees, department]);

  const filteredPayslips = useMemo(() => {
    return payslips.filter((item) => {
      const matchesMonth =
        `${item.payslipYear}-${String(item.payslipMonth).padStart(2, "0")}` === month;

      const employee = employees.find(
        (emp) => emp.id === item.employeeId
      );

      const matchesDepartment =
        department === "All" ||
        employee?.department === department;

      return matchesMonth && matchesDepartment;
    });
  }, [payslips, employees, month, department]);

  const activeReport = reportTypes.find(
    (item) => item.id === reportType
  );

  const exportCSV = () => {
    let headers = [];
    let rows = [];

    if (reportType === "employees") {
      headers = [
        "Employee ID",
        "Employee Code",
        "Employee Name",
        "Email",
        "Department",
        "Designation",
        "Manager",
        "Joining Date",
        "Status",
      ];

      rows = filteredEmployees.map((item) => [
        item.id,
        item.code,
        item.name,
        item.email,
        item.department,
        item.designation,
        item.manager,
        item.joined,
        item.status,
      ]);
    } else if (reportType === "payroll") {
      headers = [
        "Payslip ID",
        "Employee ID",
        "Employee Name",
        "Department",
        "Payslip Month",
        "Upload Date",
        "Uploaded By",
      ];

      rows = filteredPayslips.map((item) => {
        const employee = employees.find(
          (emp) => emp.id === item.employeeId
        );

        return [
          item.id,
          item.employeeId,
          item.employeeName,
          employee?.department || "",
          getPayslipPeriod(item),
          item.uploadDate,
          item.uploadedBy,
        ];
      });
    } else {
      return;
    }

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value ?? "").replaceAll('"', '""')}"`
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

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

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

  const isUnavailable =
    reportType === "attendance" || reportType === "leave";

  const recordCount =
    reportType === "employees"
      ? filteredEmployees.length
      : reportType === "payroll"
        ? filteredPayslips.length
        : 0;

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

        .reports-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
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

        .report-message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 22px;
          color: var(--muted, #7a8192);
          line-height: 1.6;
        }

        .report-message strong {
          color: var(--text, #202536);
          display: block;
          margin-bottom: 5px;
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

          <button
            className="reports-btn"
            onClick={exportCSV}
            disabled={isUnavailable || loading || payslipLoading}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="report-filters">
        <div className="report-filter">
          <label>
            {reportType === "employees" ? "Month filter not applicable" : "Report month"}
          </label>

          <input
            type="month"
            value={month}
            disabled={reportType === "employees"}
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
              className={`report-type ${
                reportType === report.id ? "active" : ""
              }`}
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

      {loading ? (
        <div className="report-message">
          <LoaderCircle size={22} />
          Loading actual company employee records...
        </div>
      ) : error ? (
        <div className="report-message">
          <AlertCircle size={22} />
          <div>
            <strong>Unable to load reports</strong>
            {error}
          </div>
        </div>
      ) : (
        <>
          <div className="report-stats">
            {reportType === "employees" && (
              <>
                <StatCard
                  icon={Users}
                  label="Total Employees"
                  value={filteredEmployees.length}
                  color="#6558d3"
                />

                <StatCard
                  icon={BarChart3}
                  label="Departments"
                  value={new Set(
                    filteredEmployees
                      .map((item) => item.department)
                      .filter(Boolean)
                  ).size}
                  color="#238b72"
                />

                <StatCard
                  icon={Users}
                  label="Active Employees"
                  value={filteredEmployees.filter(
                    (item) => item.status?.toUpperCase() === "ACTIVE"
                  ).length}
                  color="#238b72"
                />

                <StatCard
                  icon={FileText}
                  label="Inactive Employees"
                  value={filteredEmployees.filter(
                    (item) => item.status && item.status.toUpperCase() !== "ACTIVE"
                  ).length}
                  color="#c1842c"
                />
              </>
            )}

            {reportType === "payroll" && (
              <>
                <StatCard
                  icon={Users}
                  label="Employees"
                  value={filteredEmployees.length}
                  color="#6558d3"
                />

                <StatCard
                  icon={Wallet}
                  label="Payslips Uploaded"
                  value={filteredPayslips.length}
                  color="#238b72"
                />

                <StatCard
                  icon={CalendarDays}
                  label="Report Month"
                  value={month}
                  color="#c1842c"
                />

                <StatCard
                  icon={FileText}
                  label="Employees With Payslips"
                  value={new Set(
                    filteredPayslips.map((item) => item.employeeId)
                  ).size}
                  color="#6558d3"
                />
              </>
            )}
          </div>

          {isUnavailable ? (
            <div className="report-table-card">
              <div className="report-message">
                <AlertCircle size={24} />
                <div>
                  <strong>
                    {reportType === "attendance"
                      ? "Attendance backend integration pending"
                      : "Leave backend integration pending"}
                  </strong>

                  The backend currently does not provide attendance or
                  leave report endpoints. No demo figures are displayed.
                  This report will become available when those modules
                  are implemented.
                </div>
              </div>
            </div>
          ) : (
            <div className="report-table-card">
              <div className="report-table-heading">
                <div>
                  <h2>{activeReport?.title}</h2>
                  <p>{recordCount} records found</p>
                </div>

                <button
                  className="reports-btn secondary"
                  onClick={exportCSV}
                  disabled={payslipLoading}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>

              {reportType === "employees" && (
                <div className="report-table-wrap">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Employee Code</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Joining Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="report-empty">
                            No employees found for this department.
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.code || "—"}</td>
                            <td><strong>{item.name || "—"}</strong></td>
                            <td>{item.department || "—"}</td>
                            <td>{item.designation || "—"}</td>
                            <td>{item.joined || "—"}</td>
                            <td>
                              <span className="report-status">
                                {item.status || "Not specified"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {reportType === "payroll" && (
                <>
                  {payslipError && (
                    <div className="report-message">
                      <AlertCircle size={20} />
                      {payslipError}
                    </div>
                  )}

                  {payslipLoading ? (
                    <div className="report-message">
                      <LoaderCircle size={22} />
                      Loading payslip records...
                    </div>
                  ) : (
                    <div className="report-table-wrap">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Payslip ID</th>
                            <th>Employee ID</th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Payslip Period</th>
                            <th>Upload Date</th>
                            <th>Uploaded By</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPayslips.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="report-empty">
                                No payslip records found for the selected filters.
                              </td>
                            </tr>
                          ) : (
                            filteredPayslips.map((item) => {
                              const employee = employees.find(
                                (emp) => emp.id === item.employeeId
                              );

                              return (
                                <tr key={item.id}>
                                  <td>{item.id}</td>
                                  <td>{item.employeeId}</td>
                                  <td>
                                    <strong>
                                      {item.employeeName || employee?.name || "—"}
                                    </strong>
                                  </td>
                                  <td>{employee?.department || "—"}</td>
                                  <td>{getPayslipPeriod(item)}</td>
                                  <td>{formatDate(item.uploadDate)}</td>
                                  <td>{item.uploadedBy || "—"}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      <p className="report-note">
        Employee and payslip records are retrieved from the backend.
        Attendance and leave reports require backend implementation.
        Payslip upload records do not represent salary totals.
      </p>
    </div>
  );
}
