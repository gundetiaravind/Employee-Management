
import { useState } from "react";
import {
  Upload,
  Download,
  Trash2,
  Search,
} from "lucide-react";
import payslipService from "../../services/payslipService";
import "./PayslipManagement.css";

export default function PayslipManagement() {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("2026");
  const [file, setFile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadPayslips = async () => {
    if (!employeeId) {
      setMessage("Enter an employee database ID.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const data = await payslipService.getEmployeePayslips(employeeId);
      setPayslips(data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load payslips."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!employeeId || !month || !year || !file) {
      setMessage("Please complete all fields and select a file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await payslipService.uploadPayslip(
        employeeId,
        month,
        year,
        file
      );

      setMessage("Payslip uploaded successfully.");
      setFile(null);
      await loadPayslips();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Payslip upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const blob = await payslipService.downloadPayslip(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `payslip-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("Unable to download payslip.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payslip?")) {
      return;
    }

    try {
      await payslipService.deletePayslip(id);
      setMessage("Payslip deleted successfully.");
      await loadPayslips();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete payslip."
      );
    }
  };

  return (
    <div className="payslip-page">
      <div className="payslip-header">
        <div>
          <h2>Payslip Management</h2>
          <p>Upload and manage employee payslips.</p>
        </div>
      </div>

      {message && (
        <div className="payslip-message" role="status">
          {message}
        </div>
      )}

      <div className="payslip-card">
        <div className="payslip-card-header">
          <div className="payslip-icon">
            <Upload size={20} />
          </div>
          <div>
            <h3>Upload Payslip</h3>
            <p>Upload a PDF payslip for an employee.</p>
          </div>
        </div>

        <form className="payslip-form" onSubmit={handleUpload}>
          <div className="payslip-form-grid">
            <div className="payslip-field">
              <label>Employee Database ID</label>
              <input
                type="number"
                min="1"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
                required
              />
            </div>

            <div className="payslip-field">
              <label>Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              >
                <option value="">Select month</option>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(2000, index).toLocaleString("en", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="payslip-field">
              <label>Year</label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>

            <div className="payslip-field">
              <label>PDF Payslip</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>

          <div className="payslip-form-actions">
            <button
              type="submit"
              className="payslip-primary-btn"
              disabled={loading}
            >
              <Upload size={16} />
              {loading ? "Processing..." : "Upload Payslip"}
            </button>
          </div>
        </form>
      </div>

      <div className="payslip-card">
        <div className="payslip-list-header">
          <div>
            <h3>Employee Payslips</h3>
            <p>View and manage uploaded payslips.</p>
          </div>

          <button
            className="payslip-secondary-btn"
            onClick={loadPayslips}
            disabled={loading}
          >
            <Search size={16} />
            {loading ? "Loading..." : "Load Payslips"}
          </button>
        </div>

        {payslips.length === 0 ? (
          <div className="payslip-empty">
            <div className="payslip-empty-icon">
              <Search size={25} />
            </div>
            <h4>No payslips loaded</h4>
            <p>Enter an employee ID and load payslips to view records.</p>
          </div>
        ) : (
          <div className="payslip-table-wrapper">
            <table className="payslip-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td>#{payslip.id}</td>
                    <td>{payslip.payslipMonth}</td>
                    <td>{payslip.payslipYear}</td>
                    <td>{payslip.uploadDate || "—"}</td>
                    <td>
                      <div className="payslip-actions">
                        <button
                          className="payslip-action-btn download-btn"
                          title="Download"
                          onClick={() => handleDownload(payslip.id)}
                        >
                          <Download size={16} />
                        </button>

                        <button
                          className="payslip-action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(payslip.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
