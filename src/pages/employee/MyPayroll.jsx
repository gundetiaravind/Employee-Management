



import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Wallet,
  IndianRupee,
  CalendarDays,
  CheckCircle,
  FileText,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import payslipService from "../../services/payslipService";
import html2pdf from "html2pdf.js";
import "./MyPayroll.css";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatCurrency = (amount) =>
  amount == null ? "--" : currency(amount);

const getEarnings = (record) => {
  if (!record.hasSalaryDetails) return null;
  if (record.grossSalary != null) return record.grossSalary;

  return (
    Number(record.basic || 0) +
    Number(record.hra || 0) +
    Number(record.allowances || 0) +
    Number(record.bonus || 0)
  );
};

const getDeductions = (record) => {
  if (!record.hasSalaryDetails) return null;
  if (record.totalDeductions != null) return record.totalDeductions;

  return (
    Number(record.pf || 0) +
    Number(record.tax || 0) +
    Number(record.otherDeductions || 0)
  );
};

const getNetSalary = (record) => {
  if (!record.hasSalaryDetails) return null;
  if (record.netSalary != null) return record.netSalary;

  return getEarnings(record) - getDeductions(record);
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthNumber = (month) => {
  const numericMonth = Number(month);
  if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return numericMonth;
  }

  const parsedMonth = new Date(`${month} 1, 2000`);
  return Number.isNaN(parsedMonth.getTime())
    ? 0
    : parsedMonth.getMonth() + 1;
};

/* -------------------------------------------------------
   Backend response mapper
------------------------------------------------------- */
const mapPayslip = (item, index) => {
  const salaryFields = [
    item.basicSalary,
    item.hra,
    item.allowances,
    item.bonus,
    item.providentFund,
    item.tax,
    item.otherDeductions,
    item.grossSalary,
    item.totalDeductions,
    item.netSalary,
  ];
  const rawStatus = String(item.status || "PAID").toUpperCase();
  const statusLabels = {
    PAID: "Paid",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
  };

  return {
    id: item.id ?? index + 1,

    employeeId: item.employeeId ?? "-",

    employeeCode:
      item.employeeCode ||
      item.employee?.employeeCode ||
      "-",

    employeeName:
      item.employeeName ||
      item.employee?.name ||
      "-",

    month:
      item.payMonth ||
      (item.payslipMonth
        ? new Date(2000, item.payslipMonth - 1).toLocaleString("en-US", {
            month: "short",
          })
        : "-"),
    year: item.payYear ?? item.payslipYear ?? "-",
    payDate: item.payDate || "-",

    basic: item.basicSalary == null ? null : Number(item.basicSalary),
    hra: item.hra == null ? null : Number(item.hra),
    allowances:
      item.allowances == null ? null : Number(item.allowances),
    bonus: item.bonus == null ? null : Number(item.bonus),

    pf:
      item.providentFund == null ? null : Number(item.providentFund),
    tax: item.tax == null ? null : Number(item.tax),
    otherDeductions:
      item.otherDeductions == null
        ? null
        : Number(item.otherDeductions),

    grossSalary:
      item.grossSalary == null ? null : Number(item.grossSalary),
    totalDeductions:
      item.totalDeductions == null
        ? null
        : Number(item.totalDeductions),
    netSalary: item.netSalary == null ? null : Number(item.netSalary),

    hasSalaryDetails: salaryFields.every((value) => value != null),
    status: statusLabels[rawStatus] || rawStatus,
  };
};

/* -------------------------------------------------------
   PDF generator
------------------------------------------------------- */

function downloadPayslip(record) {
  const earnings = getEarnings(record);
  const deductions = getDeductions(record);
  const netSalary = getNetSalary(record);

  const payslipElement = document.createElement("div");

  payslipElement.innerHTML = `
    <div style="
      width: 700px;
      padding: 35px;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      color: #202536;
      background: #ffffff;
    ">

      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #6558d3;
        padding-bottom: 18px;
        margin-bottom: 22px;
      ">
        <div>
          <h1 style="
            margin: 0;
            font-size: 25px;
            color: #6558d3;
          ">
            ORGCONNECT
          </h1>

          <p style="
            margin: 6px 0 0;
            font-size: 12px;
            color: #777;
          ">
            Employee Management System
          </p>
        </div>

        <div style="text-align: right;">
          <h2 style="
            margin: 0;
            font-size: 20px;
          ">
            PAYSLIP
          </h2>

          <p style="
            margin: 6px 0 0;
            font-size: 12px;
            color: #777;
          ">
            ${record.month} ${record.year}
          </p>
        </div>
      </div>

      <!-- Employee Information -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 25px;
        padding: 15px;
        background: #f6f7fb;
        border-radius: 8px;
      ">

        <div>
          <div style="font-size: 11px; color: #777;">
            Employee Code
          </div>

          <div style="
            font-size: 13px;
            font-weight: 600;
            margin-top: 4px;
          ">
            ${record.employeeCode}
          </div>
        </div>

        <div>
          <div style="font-size: 11px; color: #777;">
            Employee Name
          </div>

          <div style="
            font-size: 13px;
            font-weight: 600;
            margin-top: 4px;
          ">
            ${record.employeeName || "-"}
          </div>
        </div>

        <div>
          <div style="font-size: 11px; color: #777;">
            Pay Period
          </div>

          <div style="
            font-size: 13px;
            font-weight: 600;
            margin-top: 4px;
          ">
            ${record.month} ${record.year}
          </div>
        </div>

        <div>
          <div style="font-size: 11px; color: #777;">
            Payment Date
          </div>

          <div style="
            font-size: 13px;
            font-weight: 600;
            margin-top: 4px;
          ">
            ${formatDate(record.payDate)}
          </div>
        </div>

      </div>

      <!-- Earnings and Deductions -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
      ">

        <!-- Earnings -->
        <div>
          <h3 style="
            margin: 0 0 10px;
            font-size: 15px;
            color: #16834b;
          ">
            Earnings
          </h3>

          <div style="border-top: 1px solid #e7e9f0;">

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Basic Salary</span>
              <span>${currency(record.basic)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>HRA</span>
              <span>${currency(record.hra)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Allowances</span>
              <span>${currency(record.allowances)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Bonus</span>
              <span>${currency(record.bonus)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 13px;
              font-weight: 700;
            ">
              <span>Gross Salary</span>
              <span>${currency(earnings)}</span>
            </div>

          </div>
        </div>

        <!-- Deductions -->
        <div>
          <h3 style="
            margin: 0 0 10px;
            font-size: 15px;
            color: #c43d3d;
          ">
            Deductions
          </h3>

          <div style="border-top: 1px solid #e7e9f0;">

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Provident Fund</span>
              <span>${currency(record.pf)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Tax</span>
              <span>${currency(record.tax)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e7e9f0;
              font-size: 12px;
            ">
              <span>Other Deductions</span>
              <span>${currency(record.otherDeductions)}</span>
            </div>

            <div style="
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 13px;
              font-weight: 700;
            ">
              <span>Total Deductions</span>
              <span>${currency(deductions)}</span>
            </div>

          </div>
        </div>

      </div>

      <!-- Net Salary -->
      <div style="
        margin-top: 25px;
        padding: 20px;
        border-radius: 10px;
        background: #efedff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="
            font-size: 12px;
            font-weight: 600;
            color: #5144bd;
          ">
            NET SALARY
          </div>

          <div style="
            margin-top: 5px;
            font-size: 25px;
            font-weight: 700;
            color: #5144bd;
          ">
            ${currency(netSalary)}
          </div>
        </div>

        <div style="
          font-size: 11px;
          color: #5144bd;
          text-align: right;
        ">
          Amount after<br />
          all deductions
        </div>
      </div>

      <!-- Status -->
      <div style="
        margin-top: 18px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #16834b;
      ">
        Payment Status: ${record.status || "PAID"}
      </div>

      <!-- Footer -->
      <div style="
        margin-top: 35px;
        padding-top: 15px;
        border-top: 1px solid #e7e9f0;
        text-align: center;
        font-size: 10px;
        color: #888;
      ">
        This is a demonstration payslip and not an official payroll document.
      </div>

    </div>
  `;

  document.body.appendChild(payslipElement);

  const options = {
    margin: 0,
    filename: `payslip-${record.month}-${record.year}.pdf`,
    image: {
      type: "jpeg",
      quality: 0.98,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"],
    },
  };

  html2pdf()
    .set(options)
    .from(payslipElement)
    .save()
    .then(() => {
      if (document.body.contains(payslipElement)) {
        document.body.removeChild(payslipElement);
      }
    })
    .catch((error) => {
      console.error("Payslip PDF generation failed:", error);

      if (document.body.contains(payslipElement)) {
        document.body.removeChild(payslipElement);
      }
    });
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function MyPayroll() {
  const [payrollRecords, setPayrollRecords] = useState([]);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");

  const [selectedRecord, setSelectedRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingPayslipId, setDownloadingPayslipId] = useState(null);

  /* -----------------------------------------------------
     Fetch logged-in employee payslips
  ----------------------------------------------------- */

  useEffect(() => {
    let active = true;

    const fetchMyPayroll = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await payslipService.getMyPayslips();
        let data = response;

        if (!Array.isArray(data)) {
          if (Array.isArray(data?.data)) {
            data = data.data;
          } else if (Array.isArray(data?.payslips)) {
            data = data.payslips;
          } else {
            throw new Error("The payslip response has an invalid format.");
          }
        }

        const mappedRecords = data.map(mapPayslip);

        mappedRecords.sort((a, b) => {
          const periodA =
            Number(a.year) * 12 + getMonthNumber(a.month);
          const periodB =
            Number(b.year) * 12 + getMonthNumber(b.month);
          return periodB - periodA;
        });

        if (active) setPayrollRecords(mappedRecords);
      } catch (requestError) {
        console.error(
          "Failed to fetch employee payslips:",
          requestError
        );

        if (active) {
          setErrorMessage(
            requestError.response?.data?.detail ||
              requestError.response?.data?.message ||
              requestError.response?.data?.error ||
              requestError.message ||
              "Unable to load your payslips."
          );
          setPayrollRecords([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMyPayroll();

    return () => {
      active = false;
    };
  }, []);

  const downloadUploadedPayslip = async (record) => {
    try {
      setDownloadingPayslipId(record.id);
      setDownloadError("");

      const file = await payslipService.downloadPayslip(record.id);
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payslip-${record.month}-${record.year}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (requestError) {
      console.error("Failed to download uploaded payslip:", requestError);
      setDownloadError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.message ||
          "Unable to download the uploaded payslip."
      );
    } finally {
      setDownloadingPayslipId(null);
    }
  };

  /* -----------------------------------------------------
     Current/latest payroll
  ----------------------------------------------------- */

  const currentPayroll = payrollRecords[0] || null;

  const totalEarnings = currentPayroll
    ? getEarnings(currentPayroll)
    : null;

  const totalDeductions = currentPayroll
    ? getDeductions(currentPayroll)
    : null;

  const netSalary = currentPayroll
    ? getNetSalary(currentPayroll)
    : null;

  /* -----------------------------------------------------
     Search + year filter
  ----------------------------------------------------- */

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase().trim();

    return payrollRecords.filter((record) => {
      const matchesSearch =
        String(record.month)
          .toLowerCase()
          .includes(value) ||
        String(record.year).includes(value);

      const matchesYear =
        yearFilter === "All" ||
        String(record.year) === yearFilter;

      return matchesSearch && matchesYear;
    });
  }, [payrollRecords, search, yearFilter]);

  /* -----------------------------------------------------
     Available years
  ----------------------------------------------------- */

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        payrollRecords
          .map((record) => String(record.year))
          .filter((year) => year !== "-")
      ),
    ];
  }, [payrollRecords]);

  /* -----------------------------------------------------
     Summary cards
  ----------------------------------------------------- */

  const summaryCards = [
    {
      label: "Monthly Net Salary",
      value: currentPayroll
        ? formatCurrency(netSalary)
        : "--",
      subtitle: currentPayroll
        ? "Latest payroll"
        : "No payroll available",
      icon: Wallet,
      color: "#16834b",
      background: "#e7f8ef",
    },
    {
      label: "Gross Earnings",
      value: currentPayroll
        ? formatCurrency(totalEarnings)
        : "--",
      subtitle: "Before deductions",
      icon: IndianRupee,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Total Deductions",
      value: currentPayroll
        ? formatCurrency(totalDeductions)
        : "--",
      subtitle: "PF, tax and others",
      icon: FileText,
      color: "#c43d3d",
      background: "#fceaea",
    },
    {
      label: "Paid Months",
      value: payrollRecords.filter(
        (record) => record.status === "Paid"
      ).length,
      subtitle: "Available payslips",
      icon: CalendarDays,
      color: "#c17b17",
      background: "#fff4df",
    },
  ];

  /* -----------------------------------------------------
     Loading
  ----------------------------------------------------- */

  if (loading) {
    return (
      <div className="my-payroll-page">
        <div className="payroll-heading">
          <div>
            <h2>My Payroll</h2>
            <p>
              View your salary details, deductions and monthly
              payslips.
            </p>
          </div>
        </div>

        <div
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Loader2
            size={30}
            className="payroll-loading-icon"
          />

          <p>Loading your payslips...</p>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------
     Error
  ----------------------------------------------------- */

  if (errorMessage) {
    return (
      <div className="my-payroll-page">
        <div className="payroll-heading">
          <div>
            <h2>My Payroll</h2>
            <p>
              View your salary details, deductions and monthly
              payslips.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "25px",
            background: "#fceaea",
            border: "1px solid #f2c5c5",
            borderRadius: "12px",
            color: "#b42318",
          }}
        >
          <h3>Unable to load payroll</h3>

          <p style={{ marginBottom: 0 }}>
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-payroll-page">

      {/* -------------------------------------------------
          Heading
      ------------------------------------------------- */}

      <div className="payroll-heading">
        <div>
          <h2>My Payroll</h2>

          <p>
            View your salary details, deductions and monthly
            payslips.
          </p>
        </div>
      </div>

      {/* -------------------------------------------------
          Summary cards
      ------------------------------------------------- */}

      <div className="payroll-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="payroll-card"
              key={card.label}
            >
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
                <div className="payroll-card-label">
                  {card.label}
                </div>

                <div className="payroll-card-value">
                  {card.value}
                </div>

                <div className="payroll-card-subtitle">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------------------------------------------------
          Latest Salary Breakdown
      ------------------------------------------------- */}

      {currentPayroll && (
        <div className="payroll-section">
          <div className="payroll-section-heading">
            <h3>Latest Salary Breakdown</h3>

            <span className="payroll-period">
              {currentPayroll.month}{" "}
              {currentPayroll.year}
            </span>
          </div>

          <div className="payroll-net-box">
            <div>
              <div className="payroll-net-label">
                Net Salary
              </div>

              <div className="payroll-net-value">
                {formatCurrency(netSalary)}
              </div>

              <div className="payroll-net-caption">
                Amount after all deductions
              </div>
            </div>

            <div className="payroll-download-actions">
              {currentPayroll.hasSalaryDetails && (
                <button
                  className="payroll-download"
                  onClick={() => downloadPayslip(currentPayroll)}
                >
                  <Download size={16} />
                  Generate Payslip PDF
                </button>
              )}
              <button
                className="payroll-download uploaded"
                disabled={downloadingPayslipId === currentPayroll.id}
                onClick={() =>
                  downloadUploadedPayslip(currentPayroll)
                }
              >
                <Download size={16} />
                {downloadingPayslipId === currentPayroll.id
                  ? "Downloading..."
                  : "Download Uploaded PDF"}
              </button>
              {!currentPayroll.hasSalaryDetails && (
                <span>Itemized salary details are not available.</span>
              )}
            </div>
          </div>

          <div className="payroll-breakdown">

            {/* Earnings */}

            <div>
              <h4>Earnings</h4>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Basic Salary
                </span>

                <span>
                  {formatCurrency(currentPayroll.basic)}
                </span>
              </div>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  HRA
                </span>

                <span>
                  {formatCurrency(currentPayroll.hra)}
                </span>
              </div>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Allowances
                </span>

                <span>
                  {formatCurrency(
                    currentPayroll.allowances
                  )}
                </span>
              </div>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Bonus
                </span>

                <span>
                  {formatCurrency(currentPayroll.bonus)}
                </span>
              </div>

              <div className="payroll-breakdown-row payroll-total">
                <span>Total Earnings</span>

                <span>
                  {formatCurrency(totalEarnings)}
                </span>
              </div>
            </div>

            {/* Deductions */}

            <div>
              <h4>Deductions</h4>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Provident Fund
                </span>

                <span>
                  {formatCurrency(currentPayroll.pf)}
                </span>
              </div>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Tax
                </span>

                <span>
                  {formatCurrency(currentPayroll.tax)}
                </span>
              </div>

              <div className="payroll-breakdown-row">
                <span className="payroll-breakdown-label">
                  Other Deductions
                </span>

                <span>
                  {formatCurrency(
                    currentPayroll.otherDeductions
                  )}
                </span>
              </div>

              <div className="payroll-breakdown-row payroll-total">
                <span>Total Deductions</span>

                <span>
                  {formatCurrency(totalDeductions)}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------
          Payroll History
      ------------------------------------------------- */}

      <div className="payroll-section">
        <div className="payroll-section-heading">
          <h3>Payroll History</h3>

          <span className="payroll-period">
            {filteredRecords.length} records
          </span>
        </div>

        {/* Toolbar */}

        <div className="payroll-toolbar">

          <div className="payroll-search">
            <Search size={17} />

            <input
              className="payroll-input"
              placeholder="Search month or year..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            className="payroll-select payroll-filter"
            value={yearFilter}
            onChange={(event) =>
              setYearFilter(event.target.value)
            }
          >
            <option value="All">
              All Years
            </option>

            {availableYears.map((year) => (
              <option
                value={year}
                key={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}

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
                        {record.month}{" "}
                        {record.year}
                      </div>
                    </td>

                    <td>
                      {formatDate(record.payDate)}
                    </td>

                    <td>
                      {formatCurrency(
                        getEarnings(record)
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        getDeductions(record)
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          getNetSalary(record)
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`payroll-status ${record.status.toLowerCase()}`}
                      >
                        {record.status === "Paid" && (
                          <CheckCircle size={13} />
                        )}

                        {record.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="payroll-view"
                        onClick={() =>
                          setSelectedRecord(record)
                        }
                      >
                        <Eye size={14} />

                        View
                      </button>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="payroll-empty"
                  >
                    <FileText size={25} />

                    <p>
                      No payroll records found.
                    </p>
                  </td>
                </tr>

              )}

            </tbody>

          </table>
        </div>

        {downloadError && (
          <p className="payroll-error" role="alert">
            {downloadError}
          </p>
        )}

        <p className="payroll-note">
          Itemized salary details are shown when available. The uploaded
          payslip PDF can also be downloaded.
        </p>
      </div>

      {/* -------------------------------------------------
          Payslip Modal
      ------------------------------------------------- */}

      {selectedRecord && (

        <div
          className="payroll-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
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
                Payslip Details -{" "}
                {selectedRecord.month}{" "}
                {selectedRecord.year}
              </h3>

              <button
                className="payroll-close"
                onClick={() =>
                  setSelectedRecord(null)
                }
                aria-label="Close payslip details"
              >
                <X size={18} />
              </button>

            </div>

            <div className="payroll-breakdown">

              {/* Earnings */}

              <div>

                <h4>Earnings</h4>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    Basic Salary
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.basic
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    HRA
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.hra
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    Allowances
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.allowances
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    Bonus
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.bonus
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row payroll-total">
                  <span>Gross</span>

                  <span>
                    {formatCurrency(
                      getEarnings(
                        selectedRecord
                      )
                    )}
                  </span>
                </div>

              </div>

              {/* Deductions */}

              <div>

                <h4>Deductions</h4>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    PF
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.pf
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    Tax
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.tax
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row">
                  <span className="payroll-breakdown-label">
                    Other
                  </span>

                  <span>
                    {formatCurrency(
                      selectedRecord.otherDeductions
                    )}
                  </span>
                </div>

                <div className="payroll-breakdown-row payroll-total">
                  <span>Deductions</span>

                  <span>
                    {formatCurrency(
                      getDeductions(
                        selectedRecord
                      )
                    )}
                  </span>
                </div>

              </div>

            </div>

            <div className="payroll-modal-total">

              <span>Net Salary</span>

              <span>
                {formatCurrency(
                  getNetSalary(
                    selectedRecord
                  )
                )}
              </span>

            </div>

            {downloadError && (
              <p className="payroll-error" role="alert">
                {downloadError}
              </p>
            )}

            <div className="payroll-download-actions">
              {selectedRecord.hasSalaryDetails && (
                <button
                  className="payroll-download"
                  onClick={() => downloadPayslip(selectedRecord)}
                >
                  <Download size={16} />
                  Generate Payslip PDF
                </button>
              )}
              <button
                className="payroll-download uploaded"
                disabled={downloadingPayslipId === selectedRecord.id}
                onClick={() => downloadUploadedPayslip(selectedRecord)}
              >
                <Download size={16} />
                {downloadingPayslipId === selectedRecord.id
                  ? "Downloading..."
                  : "Download Uploaded PDF"}
              </button>
              {!selectedRecord.hasSalaryDetails && (
                <span>Itemized salary details are not available.</span>
              )}
            </div>

          </div>

        </div>

      )}

    </div>
  );
}