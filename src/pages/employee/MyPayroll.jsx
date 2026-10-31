
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Wallet,
  IndianRupee,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  X,
} from "lucide-react";

const payrollRecords = [
  {
    id: 1,
    month: "October",
    year: 2026,
    payDate: "2026-10-31",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 2000,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
  {
    id: 2,
    month: "September",
    year: 2026,
    payDate: "2026-09-30",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 0,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
  {
    id: 3,
    month: "August",
    year: 2026,
    payDate: "2026-08-31",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 0,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
  {
    id: 4,
    month: "July",
    year: 2026,
    payDate: "2026-07-31",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 0,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
  {
    id: 5,
    month: "June",
    year: 2026,
    payDate: "2026-06-30",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 0,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
  {
    id: 6,
    month: "May",
    year: 2026,
    payDate: "2026-05-31",
    basic: 22000,
    hra: 8000,
    allowances: 5000,
    bonus: 0,
    pf: 1800,
    tax: 700,
    otherDeductions: 0,
    status: "Paid",
  },
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getEarnings = (record) =>
  record.basic + record.hra + record.allowances + record.bonus;

const getDeductions = (record) =>
  record.pf + record.tax + record.otherDeductions;

const getNetSalary = (record) =>
  getEarnings(record) - getDeductions(record);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function downloadPayslip(record) {
  const earnings = getEarnings(record);
  const deductions = getDeductions(record);
  const netSalary = getNetSalary(record);

  const lines = [
    "ORGCONNECT - EMPLOYEE PAYSLIP",
    "----------------------------------------",
    `Employee ID: EMP001 (Demo)`,
    `Employee Name: Employee Demo`,
    `Pay Period: ${record.month} ${record.year}`,
    `Payment Date: ${formatDate(record.payDate)}`,
    "",
    "EARNINGS",
    `Basic Salary: ${currency(record.basic)}`,
    `HRA: ${currency(record.hra)}`,
    `Allowances: ${currency(record.allowances)}`,
    `Bonus: ${currency(record.bonus)}`,
    `Total Earnings: ${currency(earnings)}`,
    "",
    "DEDUCTIONS",
    `Provident Fund: ${currency(record.pf)}`,
    `Tax: ${currency(record.tax)}`,
    `Other Deductions: ${currency(record.otherDeductions)}`,
    `Total Deductions: ${currency(deductions)}`,
    "",
    `NET SALARY: ${currency(netSalary)}`,
    "",
    "This is a demonstration payslip, not an official payroll document.",
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `payslip-${record.month}-${record.year}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}

export default function MyPayroll() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const currentPayroll = payrollRecords[0];

  const totalEarnings = getEarnings(currentPayroll);
  const totalDeductions = getDeductions(currentPayroll);
  const netSalary = getNetSalary(currentPayroll);

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return payrollRecords.filter((record) => {
      const matchesSearch =
        record.month.toLowerCase().includes(value) ||
        String(record.year).includes(value);

      const matchesYear =
        yearFilter === "All" || String(record.year) === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [search, yearFilter]);

  const summaryCards = [
    {
      label: "Monthly Net Salary",
      value: currency(netSalary),
      subtitle: "Latest payroll",
      icon: Wallet,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Gross Earnings",
      value: currency(totalEarnings),
      subtitle: "Before deductions",
      icon: IndianRupee,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Total Deductions",
      value: currency(totalDeductions),
      subtitle: "PF, tax and others",
      icon: FileText,
      color: "#c43d3d",
      background: "#fceaea",
    },
    {
      label: "Paid Months",
      value: payrollRecords.filter((record) => record.status === "Paid").length,
      subtitle: "Available payslips",
      icon: CalendarDays,
      color: "#c17b17",
      background: "#fff4df",
    },
  ];

  return (
    <div className="my-payroll-page">
      <style>{`
        .my-payroll-page {
          width: 100%;
          color: var(--emp-text, #202536);
        }

        .payroll-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .payroll-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .payroll-heading p {
          margin: 0;
          color: var(--emp-muted, #7a8192);
          font-size: 14px;
        }

        .payroll-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .payroll-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .payroll-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .payroll-card-label {
          color: var(--emp-muted, #7a8192);
          font-size: 13px;
        }

        .payroll-card-value {
          margin-top: 5px;
          font-size: 21px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .payroll-card-subtitle {
          margin-top: 3px;
          color: var(--emp-muted, #7a8192);
          font-size: 11px;
        }

        .payroll-section {
          padding: 20px;
          margin-bottom: 22px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .payroll-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .payroll-section-heading h3 {
          margin: 0;
          font-size: 17px;
        }

        .payroll-period {
          color: var(--emp-muted, #7a8192);
          font-size: 13px;
        }

        .payroll-net-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          padding: 18px;
          margin-bottom: 20px;
          border-radius: 10px;
          background: #efedff;
          color: #5144bd;
        }

        .payroll-net-label {
          font-size: 13px;
          font-weight: 600;
        }

        .payroll-net-value {
          margin-top: 5px;
          font-size: 27px;
          font-weight: 700;
        }

        .payroll-net-caption {
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.8;
        }

        .payroll-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .payroll-breakdown h4 {
          margin: 0 0 14px;
          font-size: 14px;
        }

        .payroll-breakdown-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
          font-size: 13px;
        }

        .payroll-breakdown-row:last-child {
          border-bottom: none;
        }

        .payroll-breakdown-label {
          color: var(--emp-muted, #7a8192);
        }

        .payroll-total {
          font-weight: 700;
          color: var(--emp-text, #202536);
        }

        .payroll-download {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: none;
          border-radius: 8px;
          background: #6558d3;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .payroll-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .payroll-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .payroll-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--emp-muted, #7a8192);
        }

        .payroll-input,
        .payroll-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: var(--emp-input, white);
          color: var(--emp-text, #202536);
          outline: none;
        }

        .payroll-search .payroll-input {
          padding-left: 40px;
        }

        .payroll-filter {
          width: 160px;
        }

        .payroll-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .payroll-table {
          width: 100%;
          min-width: 750px;
          border-collapse: collapse;
        }

        .payroll-table th,
        .payroll-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .payroll-table th {
          background: var(--emp-hover, #f6f7fb);
          color: var(--emp-muted, #7a8192);
          font-weight: 600;
        }

        .payroll-table tbody tr:last-child td {
          border-bottom: none;
        }

        .payroll-month {
          font-weight: 600;
        }

        .payroll-muted {
          margin-top: 4px;
          color: var(--emp-muted, #7a8192);
          font-size: 11px;
        }

        .payroll-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 20px;
          background: #e7f8ef;
          color: #16834b;
          font-size: 12px;
          font-weight: 600;
        }

        .payroll-view {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 7px;
          background: transparent;
          color: var(--emp-text, #202536);
          cursor: pointer;
          font-size: 12px;
        }

        .payroll-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--emp-muted, #7a8192);
        }

        .payroll-note {
          margin-top: 15px;
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        .payroll-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(15, 20, 35, 0.55);
        }

        .payroll-modal {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 14px;
          background: var(--emp-card, white);
          color: var(--emp-text, #202536);
        }

        .payroll-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .payroll-modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .payroll-close {
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

        .payroll-modal-total {
          padding: 15px;
          margin-top: 15px;
          border-radius: 9px;
          background: #efedff;
          color: #5144bd;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .payroll-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .payroll-summary {
            grid-template-columns: 1fr;
          }

          .payroll-breakdown {
            grid-template-columns: 1fr;
          }

          .payroll-filter {
            width: 100%;
          }

          .payroll-section {
            padding: 15px;
          }

          .payroll-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="payroll-heading">
        <div>
          <h2>My Payroll</h2>
          <p>View your salary details, deductions and monthly payslips.</p>
        </div>
      </div>

      <div className="payroll-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="payroll-card" key={card.label}>
              <div
                className="payroll-card-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="payroll-card-label">{card.label}</div>
                <div className="payroll-card-value">{card.value}</div>
                <div className="payroll-card-subtitle">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="payroll-section">
        <div className="payroll-section-heading">
          <h3>Latest Salary Breakdown</h3>
          <span className="payroll-period">
            {currentPayroll.month} {currentPayroll.year}
          </span>
        </div>

        <div className="payroll-net-box">
          <div>
            <div className="payroll-net-label">Net Salary</div>
            <div className="payroll-net-value">
              {currency(netSalary)}
            </div>
            <div className="payroll-net-caption">
              Amount after all deductions
            </div>
          </div>

          <button
            className="payroll-download"
            onClick={() => downloadPayslip(currentPayroll)}
          >
            <Download size={16} />
            Download Payslip
          </button>
        </div>

        <div className="payroll-breakdown">
          <div>
            <h4>Earnings</h4>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Basic Salary</span>
              <span>{currency(currentPayroll.basic)}</span>
            </div>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">HRA</span>
              <span>{currency(currentPayroll.hra)}</span>
            </div>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Allowances</span>
              <span>{currency(currentPayroll.allowances)}</span>
            </div>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Bonus</span>
              <span>{currency(currentPayroll.bonus)}</span>
            </div>

            <div className="payroll-breakdown-row payroll-total">
              <span>Total Earnings</span>
              <span>{currency(totalEarnings)}</span>
            </div>
          </div>

          <div>
            <h4>Deductions</h4>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Provident Fund</span>
              <span>{currency(currentPayroll.pf)}</span>
            </div>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Tax</span>
              <span>{currency(currentPayroll.tax)}</span>
            </div>

            <div className="payroll-breakdown-row">
              <span className="payroll-breakdown-label">Other Deductions</span>
              <span>{currency(currentPayroll.otherDeductions)}</span>
            </div>

            <div className="payroll-breakdown-row payroll-total">
              <span>Total Deductions</span>
              <span>{currency(totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payroll-section">
        <div className="payroll-section-heading">
          <h3>Payroll History</h3>
          <span className="payroll-period">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="payroll-toolbar">
          <div className="payroll-search">
            <Search size={17} />
            <input
              className="payroll-input"
              placeholder="Search month or year..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="payroll-select payroll-filter"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div className="payroll-table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Pay Period</th>
                <th>Pay Date</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Payslip</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="payroll-month">
                        {record.month} {record.year}
                      </div>
                    </td>
                    <td>{formatDate(record.payDate)}</td>
                    <td>{currency(getEarnings(record))}</td>
                    <td>{currency(getDeductions(record))}</td>
                    <td>
                      <strong>{currency(getNetSalary(record))}</strong>
                    </td>
                    <td>
                      <span className="payroll-status">
                        <CheckCircle size={13} />
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="payroll-view"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="payroll-empty">
                    <FileText size={25} />
                    <p>No payroll records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="payroll-note">
          Demo data: Salary figures and payslips are sample records and are
          not connected to the backend. Downloaded payslips are text
          demonstrations, not official salary documents.
        </p>
      </div>

      {selectedRecord && (
        <div
          className="payroll-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <div
            className="payroll-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payroll-modal-title"
          >
            <div className="payroll-modal-header">
              <h3 id="payroll-modal-title">
                Payslip Details - {selectedRecord.month}{" "}
                {selectedRecord.year}
              </h3>

              <button
                className="payroll-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close payslip details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="payroll-breakdown">
              <div>
                <h4>Earnings</h4>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">Basic Salary</span>
                  <span>{currency(selectedRecord.basic)}</span>
                </div>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">HRA</span>
                  <span>{currency(selectedRecord.hra)}</span>
                </div>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">Allowances</span>
                  <span>{currency(selectedRecord.allowances)}</span>
                </div>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">Bonus</span>
                  <span>{currency(selectedRecord.bonus)}</span>
                </div>
                <div className="payroll-breakdown-row payroll-total">
                  <span>Gross</span>
                  <span>{currency(getEarnings(selectedRecord))}</span>
                </div>
              </div>

              <div>
                <h4>Deductions</h4>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">PF</span>
                  <span>{currency(selectedRecord.pf)}</span>
                </div>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">Tax</span>
                  <span>{currency(selectedRecord.tax)}</span>
                </div>
                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">Other</span>
                  <span>{currency(selectedRecord.otherDeductions)}</span>
                </div>
                <div className="payroll-breakdown-row payroll-total">
                  <span>Deductions</span>
                  <span>{currency(getDeductions(selectedRecord))}</span>
                </div>
              </div>
            </div>

            <div className="payroll-modal-total">
              <span>Net Salary</span>
              <span>{currency(getNetSalary(selectedRecord))}</span>
            </div>

            <button
              className="payroll-download"
              style={{ marginTop: 18 }}
              onClick={() => downloadPayslip(selectedRecord)}
            >
              <Download size={16} />
              Download Payslip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
