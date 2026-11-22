
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Wallet,
  FileText,
  Users,
  CalendarDays,
  Eye,
  RefreshCw,
} from "lucide-react";

import companyService from "../../services/companyService";
import payslipService from "../../services/payslipService";

const formatMonth = (month, year) => {
  if (!month || !year) return "Unknown";
  return `${new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-IN",
    { month: "long" }
  )} ${year}`;
};

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("en-IN");
};

export default function Payroll() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadPayroll = async () => {
    setLoading(true);
    setError("");

    try {
      const employeeData = await companyService.getCompanyEmployees();
      const employeeList = Array.isArray(employeeData)
        ? employeeData
        : [];

      setEmployees(employeeList);

      const results = await Promise.allSettled(
        employeeList.map(async (employee) => {
          const data = await payslipService.getEmployeePayslips(
            employee.id
          );

          return (Array.isArray(data) ? data : []).map((payslip) => ({
            ...payslip,
            employeeCode: employee.code || `EMP-${employee.id}`,
            employeeName:
              payslip.employeeName || employee.name || "Unknown",
            department: employee.department || "Unassigned",
            designation: employee.designation || "--",
          }));
        })
      );

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      ).length;

      const allRecords = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
        .sort((a, b) => {
          const dateA = new Date(
            a.payslipYear,
            a.payslipMonth - 1
          );
          const dateB = new Date(
            b.payslipYear,
            b.payslipMonth - 1
          );
          return dateB - dateA;
        });

      setRecords(allRecords);

      if (failedRequests > 0) {
        setError(
          `Could not load payslips for ${failedRequests} employee(s). Showing the records that loaded successfully.`
        );
      }
    } catch (err) {
      console.error("Failed to load payroll records:", err);
      setError("Unable to load employee or payslip records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const departments = useMemo(
    () =>
      [...new Set(
        employees
          .map((employee) => employee.department?.trim())
          .filter(Boolean)
      )].sort(),
    [employees]
  );

  const months = useMemo(
    () =>
      [...new Set(
        records.map((record) =>
          `${record.payslipMonth}-${record.payslipYear}`
        )
      )].sort((a, b) => {
        const [monthA, yearA] = a.split("-").map(Number);
        const [monthB, yearB] = b.split("-").map(Number);
        return yearB - yearA || monthB - monthA;
      }),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        (record.employeeName || "").toLowerCase().includes(value) ||
        (record.employeeCode || "").toLowerCase().includes(value);

      const matchesDepartment =
        departmentFilter === "All" ||
        record.department === departmentFilter;

      const recordMonth =
        `${record.payslipMonth}-${record.payslipYear}`;

      const matchesMonth =
        monthFilter === "All" || recordMonth === monthFilter;

      return matchesSearch && matchesDepartment && matchesMonth;
    });
  }, [records, search, departmentFilter, monthFilter]);

  const downloadPDF = async (record) => {
    try {
      setDownloadingId(record.id);

      const blob = await payslipService.downloadPayslip(record.id);
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `payslip-${record.employeeCode}-${record.payslipMonth}-${record.payslipYear}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error("Payslip download failed:", err);
      window.alert("Unable to download this payslip.");
    } finally {
      setDownloadingId(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Employee Code",
      "Employee Name",
      "Department",
      "Designation",
      "Payslip Month",
      "Upload Date",
      "Uploaded By",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((record) => [
      record.employeeCode,
      record.employeeName,
      record.department,
      record.designation,
      formatMonth(record.payslipMonth, record.payslipYear),
      formatDate(record.uploadDate),
      record.uploadedBy,
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "payslip-records.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Total Payslips",
      value: records.length,
      icon: FileText,
    },
    {
      label: "Employees",
      value: employees.length,
      icon: Users,
    },
    {
      label: "Employees With Payslips",
      value: new Set(records.map((record) => record.employeeId)).size,
      icon: Wallet,
    },
    {
      label: "Available Months",
      value: months.length,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="pay-page">
      <style>{`
        .pay-page {
          width: 100%;
          color: var(--text, #202536);
        }

        .pay-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .pay-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .pay-heading p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 14px;
        }

        .pay-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pay-export, .pay-refresh {
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

        .pay-refresh {
          border: 1px solid var(--border, #e7e9f0);
          background: var(--card, white);
          color: var(--text, #202536);
        }

        .pay-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .pay-summary-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
          min-width: 0;
        }

        .pay-summary-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
          background: #efedff;
          color: #6558d3;
        }

        .pay-summary-label {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .pay-summary-value {
          margin-top: 5px;
          font-size: 21px;
          font-weight: 700;
        }

        .pay-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .pay-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .pay-search svg {
          position: absolute;
          top: 50%;
          left: 13px;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .pay-input, .pay-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .pay-search .pay-input {
          padding-left: 40px;
        }

        .pay-filter {
          width: 175px;
        }

        .pay-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .pay-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .pay-table th, .pay-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .pay-table th {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-weight: 600;
        }

        .pay-table tbody tr:last-child td {
          border-bottom: none;
        }

        .pay-employee {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .pay-muted {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .pay-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .pay-action-btn {
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

        .pay-action-btn:disabled {
          opacity: .5;
          cursor: wait;
        }

        .pay-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }

        .pay-message {
          margin-bottom: 15px;
          padding: 12px 15px;
          border-radius: 8px;
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-size: 13px;
        }

        .pay-error {
          color: #b42318;
          background: #fff0ee;
        }

        .pay-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, .45);
        }

        .pay-modal {
          width: 100%;
          max-width: 490px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 14px;
          background: var(--card, white);
          color: var(--text, #202536);
        }

        .pay-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .pay-modal-header h3 {
          margin: 0;
        }

        .pay-detail {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border, #e7e9f0);
          font-size: 14px;
        }

        .pay-detail span:first-child {
          color: var(--muted, #7a8192);
        }

        @media (max-width: 1000px) {
          .pay-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .pay-summary {
            grid-template-columns: 1fr;
          }

          .pay-filter {
            width: 100%;
          }
        }
      `}</style>

      <div className="pay-heading">
        <div>
          <h2>Payroll Management</h2>
          <p>View employee payslip uploads and download available documents.</p>
        </div>

        <div className="pay-buttons">
          <button
            className="pay-refresh"
            onClick={loadPayroll}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="pay-export"
            onClick={exportCSV}
            disabled={filteredRecords.length === 0}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="pay-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="pay-summary-card" key={card.label}>
              <div className="pay-summary-icon">
                <Icon size={21} />
              </div>
              <div>
                <div className="pay-summary-label">{card.label}</div>
                <div className="pay-summary-value">{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pay-message">
        This page displays uploaded payslip records. Salary calculations and
        payment processing are not available through the current backend.
      </div>

      {error && <div className="pay-message pay-error">{error}</div>}

      <div className="pay-toolbar">
        <div className="pay-search">
          <Search size={17} />
          <input
            className="pay-input"
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="pay-select pay-filter"
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
        >
          <option value="All">All Months</option>
          {months.map((month) => {
            const [number, year] = month.split("-");
            return (
              <option key={month} value={month}>
                {formatMonth(number, year)}
              </option>
            );
          })}
        </select>

        <select
          className="pay-select pay-filter"
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
      </div>

      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Payslip Month</th>
              <th>Upload Date</th>
              <th>Uploaded By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="pay-empty">
                  Loading payslip records...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="pay-employee">
                      {record.employeeName}
                    </div>
                    <div className="pay-muted">
                      {record.employeeCode}
                    </div>
                  </td>

                  <td>{record.department}</td>
                  <td>{record.designation}</td>
                  <td>
                    {formatMonth(
                      record.payslipMonth,
                      record.payslipYear
                    )}
                  </td>
                  <td>{formatDate(record.uploadDate)}</td>
                  <td>{record.uploadedBy || "--"}</td>

                  <td>
                    <div className="pay-actions">
                      <button
                        className="pay-action-btn"
                        title="View record details"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="pay-action-btn"
                        title="Download PDF"
                        disabled={downloadingId === record.id}
                        onClick={() => downloadPDF(record)}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="pay-empty">
                  No payslip records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div
          className="pay-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <div className="pay-modal">
            <div className="pay-modal-header">
              <h3>Payslip Details</h3>
              <button
                className="pay-action-btn"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="pay-detail">
              <span>Employee</span>
              <strong>{selectedRecord.employeeName}</strong>
            </div>

            <div className="pay-detail">
              <span>Employee Code</span>
              <strong>{selectedRecord.employeeCode}</strong>
            </div>

            <div className="pay-detail">
              <span>Department</span>
              <strong>{selectedRecord.department}</strong>
            </div>

            <div className="pay-detail">
              <span>Designation</span>
              <strong>{selectedRecord.designation}</strong>
            </div>

            <div className="pay-detail">
              <span>Payslip Month</span>
              <strong>
                {formatMonth(
                  selectedRecord.payslipMonth,
                  selectedRecord.payslipYear
                )}
              </strong>
            </div>

            <div className="pay-detail">
              <span>Upload Date</span>
              <strong>{formatDate(selectedRecord.uploadDate)}</strong>
            </div>

            <div className="pay-detail">
              <span>Uploaded By</span>
              <strong>{selectedRecord.uploadedBy || "--"}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                className="pay-export"
                onClick={() => downloadPDF(selectedRecord)}
                disabled={downloadingId === selectedRecord.id}
              >
                <Download size={16} />
                Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
