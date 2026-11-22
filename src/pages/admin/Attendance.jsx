
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  CalendarDays,
  Users,
  Plus,
  Search,
  Pencil,
  X,
  RefreshCw,
} from "lucide-react";

import attendanceService from "../../services/attendanceService";
import companyService from "../../services/companyService";

const initialForm = {
  employeeId: "",
  attendanceDate: new Date().toISOString().slice(0, 10),
  checkInTime: "09:00",
  checkOutTime: "17:30",
  status: "PRESENT",
  remarks: "",
};

const statusOptions = ["PRESENT", "ABSENT", "HALF_DAY", "LATE"];

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceData, employeeData] = await Promise.all([
        attendanceService.getAllAttendance(),
        companyService.getCompanyEmployees(),
      ]);

      setRecords(Array.isArray(attendanceData) ? attendanceData : []);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const employee = employees.find(
        (emp) => Number(emp.id) === Number(record.employeeId)
      );

      const employeeName =
        record.employeeName ||
        employee?.name ||
        employee?.employeeName ||
        "";

      const matchesSearch =
        employeeName.toLowerCase().includes(search.toLowerCase()) ||
        String(record.employeeId).includes(search);

      const matchesStatus =
        statusFilter === "ALL" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, employees, search, statusFilter]);

  const presentCount = records.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "ABSENT"
  ).length;

  const lateCount = records.filter(
    (record) => record.status === "LATE"
  ).length;

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);
    setForm({
      employeeId: String(record.employeeId),
      attendanceDate: record.attendanceDate,
      checkInTime: record.checkInTime?.slice(0, 5) || "",
      checkOutTime: record.checkOutTime?.slice(0, 5) || "",
      status: record.status,
      remarks: record.remarks || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.employeeId || !form.attendanceDate || !form.status) {
      setError("Please complete all required fields.");
      return;
    }

    const payload = {
      employeeId: Number(form.employeeId),
      attendanceDate: form.attendanceDate,
      checkInTime:
        form.status === "ABSENT" || !form.checkInTime
          ? null
          : `${form.checkInTime}:00`,
      checkOutTime:
        form.status === "ABSENT" || !form.checkOutTime
          ? null
          : `${form.checkOutTime}:00`,
      status: form.status,
      remarks: form.remarks.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        await attendanceService.updateAttendance(editingId, payload);
        setSuccess("Attendance updated successfully.");
      } else {
        await attendanceService.markAttendance(payload);
        setSuccess("Attendance marked successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save attendance. Please check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  const getEmployeeName = (record) => {
    const employee = employees.find(
      (emp) => Number(emp.id) === Number(record.employeeId)
    );

    return (
      record.employeeName ||
      employee?.name ||
      employee?.employeeName ||
      `Employee ${record.employeeId}`
    );
  };

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "UNKNOWN";

  const getStatusClass = (status) =>
    `att-badge att-${status?.toLowerCase()}`;

  return (
    <div className="att-page">
      <style>{`
        .att-page {
          width: 100%;
          color: var(--text, #202536);
        }

        .att-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
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

        .att-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 8px;
          padding: 11px 16px;
          background: #6558d3;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .att-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .att-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .att-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          background: var(--card, white);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
        }

        .att-stat-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #efedff;
          color: #6558d3;
        }

        .att-stat strong {
          display: block;
          font-size: 22px;
        }

        .att-stat span {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .att-panel {
          background: var(--card, white);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          padding: 18px;
        }

        .att-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .att-search {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .att-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .att-search input,
        .att-toolbar select,
        .att-form input,
        .att-form select,
        .att-form textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          padding: 11px 12px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .att-search input {
          padding-left: 38px;
        }

        .att-toolbar select {
          width: 180px;
        }

        .att-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .att-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .att-table th,
        .att-table td {
          padding: 14px 12px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          font-size: 13px;
        }

        .att-table th {
          color: var(--muted, #7a8192);
          font-weight: 600;
          background: var(--surface, #f8f9fc);
        }

        .att-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .att-present { background: #e6f7ed; color: #21834a; }
        .att-absent { background: #ffe8e8; color: #bd3434; }
        .att-late { background: #fff2dc; color: #a76b12; }
        .att-half_day { background: #e9edff; color: #4559b8; }

        .att-edit {
          border: 0;
          background: transparent;
          color: #6558d3;
          cursor: pointer;
          padding: 6px;
        }

        .att-message {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .att-error { background: #ffe8e8; color: #bd3434; }
        .att-success { background: #e6f7ed; color: #21834a; }

        .att-empty {
          text-align: center;
          color: var(--muted, #7a8192);
          padding: 35px !important;
        }

        .att-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0,0,0,.45);
        }

        .att-modal {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--card, white);
          color: var(--text, #202536);
          border-radius: 13px;
          padding: 23px;
        }

        .att-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .att-modal-head h3 {
          margin: 0;
          font-size: 19px;
        }

        .att-close {
          border: 0;
          background: transparent;
          color: var(--muted, #7a8192);
          cursor: pointer;
        }

        .att-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .att-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        .att-full {
          grid-column: 1 / -1;
        }

        .att-form textarea {
          min-height: 75px;
          resize: vertical;
        }

        .att-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          grid-column: 1 / -1;
          margin-top: 5px;
        }

        .att-cancel {
          border: 1px solid var(--border, #e7e9f0);
          background: transparent;
          color: var(--text, #202536);
          border-radius: 8px;
          padding: 10px 15px;
          cursor: pointer;
        }

        @media (max-width: 760px) {
          .att-stats { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 480px) {
          .att-stats { grid-template-columns: 1fr 1fr; gap: 9px; }
          .att-stat { padding: 12px; }
          .att-form { grid-template-columns: 1fr; }
          .att-full { grid-column: auto; }
          .att-form-actions { grid-column: auto; }
          .att-toolbar select { width: 100%; }
        }
      `}</style>

      <div className="att-heading">
        <div>
          <h2>Attendance Management</h2>
          <p>Monitor and manage employee attendance records.</p>
        </div>

        <button className="att-btn" onClick={openCreateForm}>
          <Plus size={17} />
          Mark Attendance
        </button>
      </div>

      {error && <div className="att-message att-error">{error}</div>}
      {success && <div className="att-message att-success">{success}</div>}

      <div className="att-stats">
        <div className="att-stat">
          <div className="att-stat-icon"><Users size={21} /></div>
          <div>
            <strong>{employees.length}</strong>
            <span>Employees</span>
          </div>
        </div>

        <div className="att-stat">
          <div className="att-stat-icon"><CalendarDays size={21} /></div>
          <div>
            <strong>{records.length}</strong>
            <span>Total Records</span>
          </div>
        </div>

        <div className="att-stat">
          <div className="att-stat-icon"><Clock size={21} /></div>
          <div>
            <strong>{presentCount}</strong>
            <span>Present Records</span>
          </div>
        </div>

        <div className="att-stat">
          <div className="att-stat-icon"><Users size={21} /></div>
          <div>
            <strong>{absentCount + lateCount}</strong>
            <span>Absent / Late Records</span>
          </div>
        </div>
      </div>

      <div className="att-panel">
        <div className="att-toolbar">
          <div className="att-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          <button
            className="att-cancel"
            onClick={loadData}
            disabled={loading}
            title="Refresh attendance"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="att-table-wrap">
          <table className="att-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="att-empty">
                    Loading attendance records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="att-empty">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{getEmployeeName(record)}</td>
                    <td>{record.employeeId}</td>
                    <td>{record.attendanceDate}</td>
                    <td>{record.checkInTime?.slice(0, 5) || "—"}</td>
                    <td>{record.checkOutTime?.slice(0, 5) || "—"}</td>
                    <td>
                      <span className={getStatusClass(record.status)}>
                        {formatStatus(record.status)}
                      </span>
                    </td>
                    <td>{record.remarks || "—"}</td>
                    <td>
                      <button
                        className="att-edit"
                        title="Edit attendance"
                        onClick={() => openEditForm(record)}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="att-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div className="att-modal">
            <div className="att-modal-head">
              <h3>{editingId ? "Edit Attendance" : "Mark Attendance"}</h3>
              <button
                className="att-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form className="att-form" onSubmit={handleSubmit}>
              <label className="att-field att-full">
                Employee *
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  disabled={Boolean(editingId)}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name ||
                        employee.employeeName ||
                        `Employee ${employee.id}`}
                      {" (ID: "}
                      {employee.id}
                      {")"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="att-field">
                Attendance Date *
                <input
                  type="date"
                  name="attendanceDate"
                  value={form.attendanceDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="att-field">
                Status *
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="att-field">
                Check In
                <input
                  type="time"
                  name="checkInTime"
                  value={form.checkInTime}
                  onChange={handleChange}
                  disabled={form.status === "ABSENT"}
                />
              </label>

              <label className="att-field">
                Check Out
                <input
                  type="time"
                  name="checkOutTime"
                  value={form.checkOutTime}
                  onChange={handleChange}
                  disabled={form.status === "ABSENT"}
                />
              </label>

              <label className="att-field att-full">
                Remarks
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  maxLength={500}
                  placeholder="Enter remarks (optional)"
                />
              </label>

              <div className="att-form-actions">
                <button
                  type="button"
                  className="att-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="att-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Attendance"
                      : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
