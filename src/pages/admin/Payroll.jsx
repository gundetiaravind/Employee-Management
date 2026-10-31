
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Wallet,
  CheckCircle,
  Clock,
  IndianRupee,
  Eye,
  X,
} from "lucide-react";

const initialPayroll = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Rahul Sharma",
    department: "Engineering",
    designation: "Software Developer",
    month: "October 2026",
    basicSalary: 45000,
    allowances: 10000,
    deductions: 5000,
    netSalary: 50000,
    paymentDate: "2026-10-30",
    status: "Paid",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Priya Reddy",
    department: "Human Resources",
    designation: "HR Executive",
    month: "October 2026",
    basicSalary: 35000,
    allowances: 8000,
    deductions: 3000,
    netSalary: 40000,
    paymentDate: "--",
    status: "Pending",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Arjun Kumar",
    department: "Finance",
    designation: "Accountant",
    month: "October 2026",
    basicSalary: 38000,
    allowances: 7000,
    deductions: 5000,
    netSalary: 40000,
    paymentDate: "2026-10-30",
    status: "Paid",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Sneha Rao",
    department: "Engineering",
    designation: "UI Developer",
    month: "October 2026",
    basicSalary: 42000,
    allowances: 9000,
    deductions: 4000,
    netSalary: 47000,
    paymentDate: "--",
    status: "Pending",
  },
  {
    id: 5,
    employeeId: "EMP005",
    name: "Kiran Reddy",
    department: "Marketing",
    designation: "Marketing Executive",
    month: "October 2026",
    basicSalary: 30000,
    allowances: 6000,
    deductions: 2000,
    netSalary: 34000,
    paymentDate: "2026-10-30",
    status: "Paid",
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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Payroll() {
  const [records, setRecords] = useState(initialPayroll);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("October 2026");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const value = search.toLowerCase();

      const matchesSearch =
        record.name.toLowerCase().includes(value) ||
        record.employeeId.toLowerCase().includes(value);

      const matchesDepartment =
        departmentFilter === "All" ||
        record.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesMonth =
        monthFilter === "All" || record.month === monthFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesMonth
      );
    });
  }, [records, search, departmentFilter, statusFilter, monthFilter]);

  const totalPayroll = filteredRecords.reduce(
    (total, record) => total + record.netSalary,
    0
  );

  const paidRecords = filteredRecords.filter(
    (record) => record.status === "Paid"
  );

  const pendingRecords = filteredRecords.filter(
    (record) => record.status === "Pending"
  );

  const paidAmount = paidRecords.reduce(
    (total, record) => total + record.netSalary,
    0
  );

  const pendingAmount = pendingRecords.reduce(
    (total, record) => total + record.netSalary,
    0
  );

  const updatePaymentStatus = (id) => {
    const paymentDate = new Date().toISOString().slice(0, 10);

    setRecords((previous) =>
      previous.map((record) =>
        record.id === id
          ? { ...record, status: "Paid", paymentDate }
          : record
      )
    );

    setSelectedRecord((previous) =>
      previous?.id === id
        ? { ...previous, status: "Paid", paymentDate }
        : previous
    );
  };

  const exportCSV = () => {
    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Designation",
      "Month",
      "Basic Salary",
      "Allowances",
      "Deductions",
      "Net Salary",
      "Payment Date",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.employeeId,
      record.name,
      record.department,
      record.designation,
      record.month,
      record.basicSalary,
      record.allowances,
      record.deductions,
      record.netSalary,
      record.paymentDate,
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
    link.download = "payroll-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const summaryCards = [
    {
      label: "Total Payroll",
      value: formatCurrency(totalPayroll),
      icon: Wallet,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Paid Amount",
      value: formatCurrency(paidAmount),
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Pending Amount",
      value: formatCurrency(pendingAmount),
      icon: Clock,
      color: "#b7791f",
      background: "#fff4df",
    },
    {
      label: "Employees Paid",
      value: `${paidRecords.length} / ${filteredRecords.length}`,
      icon: IndianRupee,
      color: "#2671bd",
      background: "#eaf3ff",
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

        .pay-export {
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
        }

        .pay-summary-label {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .pay-summary-value {
          margin-top: 5px;
          font-size: 19px;
          font-weight: 700;
          overflow-wrap: anywhere;
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

        .pay-input,
        .pay-select {
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
          min-width: 950px;
          border-collapse: collapse;
        }

        .pay-table th,
        .pay-table td {
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

        .pay-amount {
          font-weight: 700;
          white-space: nowrap;
        }

        .pay-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .pay-status.paid {
          background: #e7f8ef;
          color: #16834b;
        }

        .pay-status.pending {
          background: #fff4df;
          color: #a76b12;
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
          opacity: .45;
          cursor: not-allowed;
        }

        .pay-action-btn:hover:not(:disabled) {
          color: var(--primary, #6558d3);
        }

        .pay-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
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

        .pay-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .pay-primary-btn {
          padding: 10px 15px;
          border: 0;
          border-radius: 8px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .pay-cancel-btn {
          padding: 10px 15px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--text, #202536);
          cursor: pointer;
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
          <p>View employee salaries and monitor monthly payroll payments.</p>
        </div>

        <button className="pay-export" onClick={exportCSV}>
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="pay-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="pay-summary-card" key={card.label}>
              <div
                className="pay-summary-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
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
          {[...new Set(records.map((record) => record.month))].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
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

        <select
          className="pay-select pay-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Month</th>
              <th>Basic Salary</th>
              <th>Net Salary</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="pay-employee">{record.name}</div>
                    <div className="pay-muted">{record.employeeId}</div>
                  </td>

                  <td>{record.department}</td>
                  <td>{record.month}</td>
                  <td>{formatCurrency(record.basicSalary)}</td>
                  <td className="pay-amount">
                    {formatCurrency(record.netSalary)}
                  </td>
                  <td>{record.paymentDate}</td>

                  <td>
                    <span
                      className={`pay-status ${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td>
                    <div className="pay-actions">
                      <button
                        className="pay-action-btn"
                        title="View salary details"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="pay-action-btn"
                        disabled={record.status === "Paid"}
                        onClick={() => updatePaymentStatus(record.id)}
                        title="Mark as paid"
                      >
                        <CheckCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="pay-empty">
                  No payroll records found.
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
              <h3>Salary Details</h3>

              <button
                className="pay-action-btn"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="pay-detail">
              <span>Employee</span>
              <strong>{selectedRecord.name}</strong>
            </div>

            <div className="pay-detail">
              <span>Employee ID</span>
              <strong>{selectedRecord.employeeId}</strong>
            </div>

            <div className="pay-detail">
              <span>Designation</span>
              <strong>{selectedRecord.designation}</strong>
            </div>

            <div className="pay-detail">
              <span>Department</span>
              <strong>{selectedRecord.department}</strong>
            </div>

            <div className="pay-detail">
              <span>Payroll Month</span>
              <strong>{selectedRecord.month}</strong>
            </div>

            <div className="pay-detail">
              <span>Basic Salary</span>
              <strong>{formatCurrency(selectedRecord.basicSalary)}</strong>
            </div>

            <div className="pay-detail">
              <span>Allowances</span>
              <strong>{formatCurrency(selectedRecord.allowances)}</strong>
            </div>

            <div className="pay-detail">
              <span>Deductions</span>
              <strong>{formatCurrency(selectedRecord.deductions)}</strong>
            </div>

            <div className="pay-detail">
              <span>Net Salary</span>
              <strong>{formatCurrency(selectedRecord.netSalary)}</strong>
            </div>

            <div className="pay-detail">
              <span>Payment Status</span>
              <strong>{selectedRecord.status}</strong>
            </div>

            <div className="pay-modal-actions">
              <button
                className="pay-cancel-btn"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>

              {selectedRecord.status === "Pending" && (
                <button
                  className="pay-primary-btn"
                  onClick={() => updatePaymentStatus(selectedRecord.id)}
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
