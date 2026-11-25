
import { useState } from "react";
import { Save, Search, RefreshCw } from "lucide-react";
import financeService from "../../services/financeService";
import "./FinanceManagement.css";

export default function FinanceManagement() {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [finance, setFinance] = useState(null);
  const [ctc, setCtc] = useState(null);

  const [financeForm, setFinanceForm] = useState({
    panNumber: "",
    aadhaarNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
  });

  const [ctcForm, setCtcForm] = useState({
    totalAnnualCtc: "",
    basicSalary: "",
    hra: "",
    specialAllowance: "",
    otherAllowances: "",
  });

  const loadFinance = async () => {
    if (!employeeId) {
      setMessage("Enter an employee database ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await financeService.getFinanceDetails(employeeId);

      setFinance(data);

      setFinanceForm({
        panNumber: "",
        aadhaarNumber: "",
        bankName: data.bankName || "",
        branchName: data.branchName || "",
        ifscCode: data.ifscCode || "",
      });

      setMessage("Finance details loaded successfully.");
    } catch (error) {
      setFinance(null);
      setMessage(
        error.response?.data?.message ||
          "Unable to load finance details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCtc = async () => {
    if (!employeeId) {
      setMessage("Enter an employee database ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await financeService.getCtcDetails(employeeId);

      setCtc(data);

      setCtcForm({
        totalAnnualCtc: data.totalAnnualCtc ?? "",
        basicSalary: data.basicSalary ?? "",
        hra: data.hra ?? "",
        specialAllowance: data.specialAllowance ?? "",
        otherAllowances: data.otherAllowances ?? "",
      });

      setMessage("CTC details loaded successfully.");
    } catch (error) {
      setCtc(null);
      setMessage(
        error.response?.data?.message ||
          "Unable to load CTC details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceChange = (event) => {
    const { name, value } = event.target;

    setFinanceForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCtcChange = (event) => {
    const { name, value } = event.target;

    setCtcForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFinanceSubmit = async (event) => {
    event.preventDefault();

    if (!employeeId) {
      setMessage("Enter an employee database ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await financeService.updateFinanceDetails(
        employeeId,
        financeForm
      );

      setFinance(data);

      setFinanceForm({
        panNumber: "",
        aadhaarNumber: "",
        bankName: data.bankName || "",
        branchName: data.branchName || "",
        ifscCode: data.ifscCode || "",
      });

      setMessage("Finance details saved successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save finance details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCtcSubmit = async (event) => {
    event.preventDefault();

    if (!employeeId) {
      setMessage("Enter an employee database ID.");
      return;
    }

    const values = Object.values(ctcForm);

    if (values.some((value) => value === "")) {
      setMessage("Please complete all CTC fields.");
      return;
    }

    const payload = {
      totalAnnualCtc: Number(ctcForm.totalAnnualCtc),
      basicSalary: Number(ctcForm.basicSalary),
      hra: Number(ctcForm.hra),
      specialAllowance: Number(ctcForm.specialAllowance),
      otherAllowances: Number(ctcForm.otherAllowances),
    };

    if (
      !Object.values(payload).every(
        (value) => Number.isFinite(value) && value >= 0
      ) ||
      payload.totalAnnualCtc <= 0
    ) {
      setMessage(
        "Enter valid non-negative salary amounts. Annual CTC must be greater than zero."
      );
      return;
    }

    const componentTotal =
      payload.basicSalary +
      payload.hra +
      payload.specialAllowance +
      payload.otherAllowances;

    if (componentTotal > payload.totalAnnualCtc) {
      setMessage("Salary components cannot exceed Total Annual CTC.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await financeService.updateCtcDetails(
        employeeId,
        payload
      );

      setCtc(data);

      setCtcForm({
        totalAnnualCtc: data.totalAnnualCtc ?? "",
        basicSalary: data.basicSalary ?? "",
        hra: data.hra ?? "",
        specialAllowance: data.specialAllowance ?? "",
        otherAllowances: data.otherAllowances ?? "",
      });

      setMessage("CTC details saved successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save CTC details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finance-page">
      <h2>Finance Management</h2>
      <p>View and manage employee finance details and CTC breakup.</p>

      {message && <p role="status">{message}</p>}

      <section>
        <h3>Employee Selection</h3>

        <label>Employee Database ID</label>

        <input
          type="number"
          min="1"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          placeholder="Enter employee ID"
        />

        <button
          type="button"
          onClick={() => {
            loadFinance();
            loadCtc();
          }}
          disabled={loading}
        >
          <Search size={16} /> Load Employee Finance
        </button>
      </section>

      <hr />

      <section>
        <h3>Employee Finance Details</h3>

        {finance && (
          <div>
            <p>Finance Record ID: {finance.id}</p>
            <p>PAN: {finance.panNumber}</p>
            <p>Aadhaar: {finance.aadhaarNumber}</p>
          </div>
        )}

        <form onSubmit={handleFinanceSubmit}>
          <div>
            <label>PAN Number</label>
            <input
              name="panNumber"
              value={financeForm.panNumber}
              onChange={handleFinanceChange}
              placeholder="Enter actual PAN number"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]"
              title="Enter a valid PAN number"
              required
            />
          </div>

          <div>
            <label>Aadhaar Number</label>
            <input
              name="aadhaarNumber"
              type="password"
              inputMode="numeric"
              maxLength="12"
              value={financeForm.aadhaarNumber}
              onChange={handleFinanceChange}
              placeholder="Enter actual 12-digit Aadhaar"
              pattern="[0-9]{12}"
              title="Aadhaar must contain exactly 12 digits"
              required
            />
          </div>

          <div>
            <label>Bank Name</label>
            <input
              name="bankName"
              value={financeForm.bankName}
              onChange={handleFinanceChange}
              required
            />
          </div>

          <div>
            <label>Branch Name</label>
            <input
              name="branchName"
              value={financeForm.branchName}
              onChange={handleFinanceChange}
              required
            />
          </div>

          <div>
            <label>IFSC Code</label>
            <input
              name="ifscCode"
              value={financeForm.ifscCode}
              onChange={handleFinanceChange}
              pattern="[A-Z]{4}0[A-Z0-9]{6}"
              title="Enter a valid IFSC code"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            <Save size={16} /> Save Finance Details
          </button>
        </form>
      </section>

      <hr />

      <section>
        <h3>CTC Breakup</h3>

        {ctc && <p>CTC Record ID: {ctc.id}</p>}

        <form onSubmit={handleCtcSubmit}>
          <div>
            <label>Total Annual CTC</label>
            <input
              type="number"
              name="totalAnnualCtc"
              min="0.01"
              step="0.01"
              value={ctcForm.totalAnnualCtc}
              onChange={handleCtcChange}
              required
            />
          </div>

          <div>
            <label>Basic Salary</label>
            <input
              type="number"
              name="basicSalary"
              min="0"
              step="0.01"
              value={ctcForm.basicSalary}
              onChange={handleCtcChange}
              required
            />
          </div>

          <div>
            <label>HRA</label>
            <input
              type="number"
              name="hra"
              min="0"
              step="0.01"
              value={ctcForm.hra}
              onChange={handleCtcChange}
              required
            />
          </div>

          <div>
            <label>Special Allowance</label>
            <input
              type="number"
              name="specialAllowance"
              min="0"
              step="0.01"
              value={ctcForm.specialAllowance}
              onChange={handleCtcChange}
              required
            />
          </div>

          <div>
            <label>Other Allowances</label>
            <input
              type="number"
              name="otherAllowances"
              min="0"
              step="0.01"
              value={ctcForm.otherAllowances}
              onChange={handleCtcChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            <Save size={16} /> Save CTC Details
          </button>
        </form>
      </section>

      {loading && <p>Processing...</p>}

      <button
        type="button"
        onClick={() => {
          loadFinance();
          loadCtc();
        }}
        disabled={loading}
      >
        <RefreshCw size={16} /> Refresh Details
      </button>
    </div>
  );
}
