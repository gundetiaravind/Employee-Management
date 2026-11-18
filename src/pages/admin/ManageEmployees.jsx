import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  Pencil,
  UserCheck,
  UserX,
  X,
  Users,
  RefreshCw,
  Mail,
  Ban,
  Clock,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import invitationService from "../../services/invitationService";

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  joiningDate: "",
  status: "Active",
};

const emptyInvitationForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  manager: "",
  joiningDate: "",
};

const getCompanyId = () => {
  try {
    const user = JSON.parse(
      sessionStorage.getItem("orgconnect-auth") || "null",
    );

    return (
      user?.companyId ?? user?.company?.id ?? user?.company?.companyId ?? null
    );
  } catch {
    return null;
  }
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const getInvitationId = (invitation) =>
  invitation?.id ?? invitation?.invitationId;

const getInvitationStatus = (invitation) =>
  String(
    invitation?.invitationStatus ?? invitation?.status ?? "UNKNOWN",
  ).toUpperCase();

const normalizeStatus = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE") return "Active";
  if (value === "INACTIVE") return "Inactive";
  if (value === "RESIGNED") return "Resigned";

  return status || "Inactive";
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("invite");
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [invitationForm, setInvitationForm] = useState(emptyInvitationForm);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formError, setFormError] = useState("");
  const [revokingId, setRevokingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getEmployeeApiConfig = (id) => {
    const companyId = getCompanyId();

    if (!companyId) {
      throw new Error("Company ID is missing. Please log in again.");
    }

    return {
      url:
        id === undefined
          ? "/api/company-owner/employees"
          : `/api/company/employees/${id}`,
      params: { companyId },
    };
  };

  // Load employees from the backend.
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setApiError("");

      const { url, params } = getEmployeeApiConfig();
      const response = await axiosInstance.get(url, { params });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(
        data.map((employee) => ({
          ...employee,
          employeeId: employee.code ?? employee.employeeId ?? "",
          name: employee.name ?? employee.employeeName ?? "",
          email: employee.email ?? "",
          department: employee.department ?? "",
          designation: employee.designation ?? "",
          joiningDate: employee.joined ?? employee.joiningDate ?? "",
          status: normalizeStatus(employee.status),
        })),
      );
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Load invitations. The backend restricts Admins to Employee invitations.
  const fetchInvitations = async () => {
    try {
      const response = await invitationService.getInvitations();

      const data = Array.isArray(response)
        ? response
        : response?.invitations || [];

      setInvitations(
        data.filter(
          (invitation) =>
            String(invitation.invitedRole || "").toUpperCase() === "EMPLOYEE",
        ),
      );
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchEmployees(), fetchInvitations()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const departments = useMemo(
    () => [
      ...new Set(
        employees.map((employee) => employee.department).filter(Boolean),
      ),
    ],
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch = [
        employee.name,
        employee.employeeId,
        employee.email,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );

      const matchesDepartment =
        departmentFilter === "All" || employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive",
  ).length;

  const pendingCount = invitations.filter(
    (invitation) => getInvitationStatus(invitation) === "PENDING",
  ).length;

  const openInviteModal = () => {
    setModalType("invite");
    setInvitationForm(emptyInvitationForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setModalType("edit");
    setEditingEmployee(employee);

    setForm({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate || "",
      status: employee.status || "Active",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingEmployee(null);
    setForm(emptyForm);
    setInvitationForm(emptyInvitationForm);
    setFormError("");
  };

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateInvitationForm = (event) => {
    const { name, value } = event.target;

    setInvitationForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Admin can invite Employees only.
  const sendInvitation = async (event) => {
    event.preventDefault();
    setFormError("");

    const code = invitationForm.employeeId.trim();
    const name = invitationForm.name.trim();
    const email = invitationForm.email.trim().toLowerCase();
    const phone = invitationForm.phone.trim();

    if (!code || !name || !email) {
      setFormError("Employment code, employee name and email are required.");
      return;
    }

    if (code.length > 20) {
      setFormError("Employment code cannot exceed 20 characters.");
      return;
    }

    if (name.length > 150) {
      setFormError("Employee name cannot exceed 150 characters.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    const duplicateCode = employees.some(
      (employee) =>
        String(employee.employeeId || "").toLowerCase() === code.toLowerCase(),
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) => String(employee.email || "").toLowerCase() === email,
    );

    if (duplicateEmail) {
      setFormError("This email already belongs to an employee.");
      return;
    }

    const duplicateInvitation = invitations.some(
      (invitation) =>
        String(invitation.email || "").toLowerCase() === email &&
        getInvitationStatus(invitation) === "PENDING",
    );

    if (duplicateInvitation) {
      setFormError("A pending invitation already exists for this email.");
      return;
    }

    try {
      setSaving(true);

      await invitationService.sendInvitation({
        invitedRole: "EMPLOYEE",
        employmentCode: code,
        employeeName: name,
        email,
        phone: phone || null,
        department: invitationForm.department.trim() || null,
        designation: invitationForm.designation.trim() || null,
        managerName: invitationForm.manager.trim() || null,
        dateOfJoining: invitationForm.joiningDate || null,
      });

      setShowModal(false);
      setInvitationForm(emptyInvitationForm);
      await fetchInvitations();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Update an existing employee.
  const saveEmployee = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!editingEmployee?.id) {
      setFormError("Employee ID is missing.");
      return;
    }

    const code = form.employeeId.trim();
    const name = form.name.trim();
    const email = form.email.trim();

    if (!code || !name || !email) {
      setFormError("Employee ID, name and email are required.");
      return;
    }

    const duplicateCode = employees.some(
      (employee) =>
        String(employee.employeeId || "").toLowerCase() ===
          code.toLowerCase() && employee.id !== editingEmployee.id,
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        String(employee.email || "").toLowerCase() === email.toLowerCase() &&
        employee.id !== editingEmployee.id,
    );

    if (duplicateEmail) {
      setFormError("This email already belongs to another employee.");
      return;
    }

    try {
      setSaving(true);

      const { url, params } = getEmployeeApiConfig(editingEmployee.id);

      await axiosInstance.put(
        url,
        {
          code,
          name,
          email,
          department: form.department || null,
          designation: form.designation || null,
          joined: form.joiningDate || null,
          status: form.status,
        },
        { params },
      );

      setShowModal(false);
      setEditingEmployee(null);
      setForm(emptyForm);

      await fetchEmployees();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Deactivate an employee using the existing backend endpoint.
  const deactivateEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${employee.name}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee.id);
      setApiError("");

      const { url, params } = getEmployeeApiConfig(employee.id);

      await axiosInstance.delete(url, { params });

      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id ? { ...item, status: "Inactive" } : item,
        ),
      );
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  // Revoke a pending invitation.
  const revokeInvitation = async (invitation) => {
    const invitationId = getInvitationId(invitation);

    if (!invitationId) {
      setApiError("Invitation ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Revoke the invitation sent to ${invitation.email}?`,
    );

    if (!confirmed) return;

    try {
      setRevokingId(invitationId);
      setApiError("");

      await invitationService.revokeInvitation(invitationId);
      await fetchInvitations();
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setRevokingId(null);
    }
  };

  const invitationStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "ACCEPTED":
        return "accepted";
      case "EXPIRED":
        return "expired";
      case "REVOKED":
        return "revoked";
      default:
        return "";
    }
  };

  return (
    <div className="manage-employees">
      <style>{`
        .manage-employees {
          color: var(--text, #202536);
          width: 100%;
        }

        .me-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .me-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .me-heading p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 14px;
        }

        .me-heading-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .me-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 17px;
          border: 0;
          border-radius: 9px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .me-primary-btn:hover {
          opacity: .9;
        }

        .me-primary-btn:disabled,
        .me-icon-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .me-refresh-btn {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--muted, #7a8192);
          cursor: pointer;
        }

        .me-error {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
          border: 1px solid #f0caca;
          border-radius: 8px;
          background: #fff2f2;
          color: #bd3838;
          font-size: 13px;
        }

        .me-error button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .me-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .me-stat {
          background: var(--card, white);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          padding: 19px;
        }

        .me-stat-label {
          color: var(--muted, #7a8192);
          font-size: 13px;
        }

        .me-stat-value {
          font-size: 25px;
          font-weight: 700;
          margin-top: 8px;
        }

        .me-section {
          margin-top: 22px;
        }

        .me-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid var(--border, #e7e9f0);
        }

        .me-section-header h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .me-section-header p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .me-count {
          padding: 6px 10px;
          border-radius: 20px;
          background: var(--bg, #f6f7fb);
          color: var(--primary, #6558d3);
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .me-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 17px;
        }

        .me-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .me-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .me-input,
        .me-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .me-search .me-input {
          padding-left: 40px;
        }

        .me-input:focus,
        .me-select:focus {
          border-color: var(--primary, #6558d3);
        }

        .me-filter {
          width: 180px;
        }

        .me-table-wrap {
          overflow-x: auto;
          background: var(--card, white);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
        }

        .me-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .me-table th,
        .me-table td {
          padding: 15px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border, #e7e9f0);
          font-size: 13px;
          white-space: nowrap;
        }

        .me-table th {
          color: var(--muted, #7a8192);
          background: var(--bg, #f6f7fb);
          font-weight: 600;
        }

        .me-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .me-employee-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .me-muted {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .me-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .me-status.active,
        .me-invitation-status.accepted {
          background: #e7f8ef;
          color: #16834b;
        }

        .me-status.inactive,
        .me-invitation-status.expired {
          background: #fceaea;
          color: #c43d3d;
        }

        .me-invitation-status.pending {
          background: #fff4df;
          color: #a66a13;
        }

        .me-invitation-status.revoked {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
        }

        .me-invitation-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .me-actions {
          display: flex;
          gap: 8px;
        }

        .me-icon-btn {
          width: 33px;
          height: 33px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 7px;
          background: var(--card, white);
          color: var(--text, #202536);
          cursor: pointer;
        }

        .me-icon-btn:hover {
          color: var(--primary, #6558d3);
          border-color: var(--primary, #6558d3);
        }

        .me-icon-btn.me-danger:hover {
          color: #c43d3d;
          border-color: #c43d3d;
        }

        .me-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }

        .me-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, .45);
        }

        .me-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 14px;
          background: var(--card, white);
          color: var(--text, #202536);
          box-shadow: 0 15px 50px rgba(0, 0, 0, .18);
        }

        .me-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .me-modal-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .me-modal-header p {
          margin: 6px 0 0;
          color: var(--muted, #7a8192);
          font-size: 12px;
          line-height: 1.5;
        }

        .me-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .me-form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .me-form-field.full {
          grid-column: 1 / -1;
        }

        .me-form-field label {
          font-size: 13px;
          font-weight: 600;
        }

        .me-form-hint {
          grid-column: 1 / -1;
          padding: 11px 13px;
          border-radius: 8px;
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-size: 12px;
          line-height: 1.5;
        }

        .me-form-error {
          grid-column: 1 / -1;
          color: #c43d3d;
          font-size: 12px;
          margin: 0;
        }

        .me-form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .me-cancel-btn {
          padding: 10px 16px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--text, #202536);
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .me-stats {
            grid-template-columns: 1fr;
          }

          .me-filter {
            width: 100%;
          }

          .me-form-grid {
            grid-template-columns: 1fr;
          }

          .me-form-field.full,
          .me-form-hint,
          .me-form-error,
          .me-form-actions {
            grid-column: 1;
          }

          .me-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="me-heading">
        <div>
          <h2>Manage Employees</h2>
          <p>
            View employee records and invite employees to join your company.
          </p>
        </div>

        <div className="me-heading-actions">
          <button
            type="button"
            className="me-refresh-btn"
            onClick={refreshData}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            className="me-primary-btn"
            onClick={openInviteModal}
          >
            <Send size={17} />
            Invite Employee
          </button>
        </div>
      </div>

      {apiError && (
        <div className="me-error" role="alert">
          {apiError}
          <button
            type="button"
            onClick={() => setApiError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="me-stats">
        <div className="me-stat">
          <div className="me-stat-label">Total Employees</div>
          <div className="me-stat-value">{employees.length}</div>
        </div>

        <div className="me-stat">
          <div className="me-stat-label">Active Employees</div>
          <div className="me-stat-value">{activeCount}</div>
        </div>

        <div className="me-stat">
          <div className="me-stat-label">Pending Invitations</div>
          <div className="me-stat-value">{pendingCount}</div>
        </div>
      </div>

      <div className="me-toolbar">
        <div className="me-search">
          <Search size={17} />
          <input
            className="me-input"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="me-select me-filter"
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
          className="me-select me-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Resigned">Resigned</option>
        </select>
      </div>

      <div className="me-table-wrap">
        <table className="me-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="me-empty">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="me-employee-name">{employee.name}</div>
                    <div className="me-muted">{employee.email}</div>
                  </td>
                  <td>{employee.employeeId}</td>
                  <td>{employee.department || "-"}</td>
                  <td>{employee.designation || "-"}</td>
                  <td>{formatDate(employee.joiningDate)}</td>
                  <td>
                    <span
                      className={`me-status ${employee.status.toLowerCase()}`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className="me-actions">
                      <button
                        type="button"
                        className="me-icon-btn"
                        title="Edit employee"
                        onClick={() => openEditModal(employee)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="me-icon-btn me-danger"
                        title="Deactivate employee"
                        onClick={() => deactivateEmployee(employee)}
                        disabled={
                          employee.status !== "Active" ||
                          deletingId === employee.id
                        }
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="me-empty">
                  <Users size={25} />
                  <p>No employees found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Employee invitations */}
      <div className="me-section">
        <div className="me-table-wrap">
          <div className="me-section-header">
            <div>
              <h3>Employee Invitations</h3>
              <p>Track invitations sent to employees.</p>
            </div>
            <span className="me-count">
              {invitations.length} invitation
              {invitations.length === 1 ? "" : "s"}
            </span>
          </div>

          <table className="me-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employment Code</th>
                <th>Department</th>
                <th>Invited On</th>
                <th>Expires On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {invitations.length > 0 ? (
                invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  const invitationId = getInvitationId(invitation);

                  return (
                    <tr key={invitationId || invitation.email}>
                      <td>
                        <div className="me-employee-name">
                          {invitation.employeeName || invitation.name || "-"}
                        </div>
                        <div className="me-muted">{invitation.email}</div>
                      </td>
                      <td>{invitation.employmentCode || "-"}</td>
                      <td>{invitation.department || "-"}</td>
                      <td>{formatDate(invitation.createdAt)}</td>
                      <td>{formatDate(invitation.expiresAt)}</td>
                      <td>
                        <span
                          className={`me-invitation-status ${invitationStatusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {status === "PENDING" ? (
                          <button
                            type="button"
                            className="me-icon-btn me-danger"
                            title="Revoke invitation"
                            onClick={() => revokeInvitation(invitation)}
                            disabled={revokingId === invitationId}
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="me-empty">
                    <Mail size={25} />
                    <p>No employee invitations yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="me-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="me-modal">
            <div className="me-modal-header">
              <div>
                <h3>
                  {modalType === "invite" ? "Invite Employee" : "Edit Employee"}
                </h3>
                <p>
                  {modalType === "invite"
                    ? "Send an email invitation to an employee."
                    : "Update the employee information."}
                </p>
              </div>

              <button
                type="button"
                className="me-icon-btn"
                onClick={closeModal}
                aria-label="Close"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            {modalType === "invite" ? (
              <form onSubmit={sendInvitation}>
                <div className="me-form-grid">
                  <div className="me-form-field">
                    <label>Employment Code *</label>
                    <input
                      className="me-input"
                      name="employeeId"
                      value={invitationForm.employeeId}
                      onChange={updateInvitationForm}
                      placeholder="Example: EMP005"
                      maxLength={20}
                      required
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Full Name *</label>
                    <input
                      className="me-input"
                      name="name"
                      value={invitationForm.name}
                      onChange={updateInvitationForm}
                      placeholder="Employee name"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="me-form-field full">
                    <label>Company Email *</label>
                    <input
                      className="me-input"
                      type="email"
                      name="email"
                      value={invitationForm.email}
                      onChange={updateInvitationForm}
                      placeholder="employee@company.com"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Mobile Number</label>
                    <input
                      className="me-input"
                      name="phone"
                      value={invitationForm.phone}
                      onChange={updateInvitationForm}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Department</label>
                    <input
                      className="me-input"
                      name="department"
                      value={invitationForm.department}
                      onChange={updateInvitationForm}
                      placeholder="Department"
                      maxLength={100}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Designation</label>
                    <input
                      className="me-input"
                      name="designation"
                      value={invitationForm.designation}
                      onChange={updateInvitationForm}
                      placeholder="Designation"
                      maxLength={100}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Reporting Manager</label>
                    <input
                      className="me-input"
                      name="manager"
                      value={invitationForm.manager}
                      onChange={updateInvitationForm}
                      placeholder="Manager name"
                      maxLength={150}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Date of Joining</label>
                    <input
                      className="me-input"
                      type="date"
                      name="joiningDate"
                      value={invitationForm.joiningDate}
                      onChange={updateInvitationForm}
                    />
                  </div>

                  <div className="me-form-hint">
                    The employee will receive an email invitation with a link to
                    set their password and activate their account.
                  </div>

                  {formError && <p className="me-form-error">{formError}</p>}
                </div>

                <div className="me-form-actions">
                  <button
                    type="button"
                    className="me-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="me-primary-btn"
                    disabled={saving}
                  >
                    <Send size={15} />
                    {saving ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={saveEmployee}>
                <div className="me-form-grid">
                  <div className="me-form-field">
                    <label>Employment Code *</label>
                    <input
                      className="me-input"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={updateForm}
                      required
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Full Name *</label>
                    <input
                      className="me-input"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      required
                    />
                  </div>

                  <div className="me-form-field full">
                    <label>Email Address *</label>
                    <input
                      className="me-input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={updateForm}
                      required
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Department</label>
                    <input
                      className="me-input"
                      name="department"
                      value={form.department}
                      onChange={updateForm}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Designation</label>
                    <input
                      className="me-input"
                      name="designation"
                      value={form.designation}
                      onChange={updateForm}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Joining Date</label>
                    <input
                      className="me-input"
                      type="date"
                      name="joiningDate"
                      value={form.joiningDate}
                      onChange={updateForm}
                    />
                  </div>

                  <div className="me-form-field">
                    <label>Status</label>
                    <select
                      className="me-select"
                      name="status"
                      value={form.status}
                      onChange={updateForm}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {formError && <p className="me-form-error">{formError}</p>}
                </div>

                <div className="me-form-actions">
                  <button
                    type="button"
                    className="me-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="me-primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
