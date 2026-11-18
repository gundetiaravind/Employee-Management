import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Send,
  Mail,
  Clock,
  Ban,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import invitationService from "../../services/invitationService";
import "./ManageEmployees.css";

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

const displayValue = (value) => value || "-";

const normalizeEmployeeStatus = (status) => {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE") return "Active";
  if (value === "INACTIVE") return "Inactive";
  if (value === "RESIGNED") return "Resigned";

  return status || "Inactive";
};

const getInvitationId = (invitation) =>
  invitation?.id ?? invitation?.invitationId;

const getInvitationStatus = (invitation) =>
  String(
    invitation?.invitationStatus ?? invitation?.status ?? "UNKNOWN",
  ).toUpperCase();

const emptyForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  manager: "",
  joined: "",
  status: "Active",
};

const emptyInvitationForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  manager: "",
  joined: "",
};

function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [invitationForm, setInvitationForm] = useState(emptyInvitationForm);

  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const getCompanyIdOrThrow = () => {
    const companyId = getCompanyId();

    if (companyId === null || companyId === undefined || companyId === "") {
      throw new Error("Company ID is missing. Please log in again.");
    }

    return companyId;
  };

  const getEmployeeApiUrl = (id) => {
    const companyId = getCompanyIdOrThrow();

    const baseUrl =
      id === undefined
        ? "/api/company-owner/employees"
        : `/api/company/employees/${id}`;

    return {
      url: baseUrl,
      params: { companyId },
    };
  };

  // Fetch existing employee records.
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setApiError("");

      const { url, params } = getEmployeeApiUrl();
      const response = await axiosInstance.get(url, { params });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(
        data.map((employee) => ({
          ...employee,
          status: normalizeEmployeeStatus(employee.status),
        })),
      );
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Fetch invitations for the logged-in company.
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

  const refreshPage = async () => {
    await Promise.all([fetchEmployees(), fetchInvitations()]);
  };

  useEffect(() => {
    refreshPage();
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
      const searchableValues = [
        employee.code,
        employee.name,
        employee.email,
        employee.department,
        employee.designation,
        employee.manager,
        employee.phone,
      ];

      const matchesSearch = searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" || employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive",
  ).length;

  const pendingInvitationCount = invitations.filter(
    (invitation) => getInvitationStatus(invitation) === "PENDING",
  ).length;

  // Open the invitation form.
  const openAdd = () => {
    setInvitationForm(emptyInvitationForm);
    setSelectedEmployee(null);
    setFormError("");
    setModal("invite");
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);

    setForm({
      code: employee.code || "",
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      manager: employee.manager || "",
      joined: employee.joined || "",
      status: employee.status || "Active",
    });

    setFormError("");
    setModal("edit");
  };

  const openView = (employee) => {
    setSelectedEmployee(employee);
    setModal("view");
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateInvitationField = (event) => {
    const { name, value } = event.target;

    setInvitationForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Send an Employee invitation instead of directly creating an account.
  const sendEmployeeInvitation = async (event) => {
    event.preventDefault();
    setFormError("");

    const code = invitationForm.code.trim();
    const name = invitationForm.name.trim();
    const email = invitationForm.email.trim().toLowerCase();
    const phone = invitationForm.phone.trim();

    if (!code || !name || !email) {
      setFormError(
        "Employment code, employee name and company email are required.",
      );
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
        String(employee.code || "").toLowerCase() === code.toLowerCase(),
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) => String(employee.email || "").toLowerCase() === email,
    );

    if (duplicateEmail) {
      setFormError("This company email already belongs to an employee.");
      return;
    }

    const duplicateInvitation = invitations.some(
      (invitation) =>
        String(invitation.email || "").toLowerCase() === email &&
        getInvitationStatus(invitation) === "PENDING",
    );

    if (duplicateInvitation) {
      setFormError(
        "A pending invitation already exists for this email address.",
      );
      return;
    }

    try {
      setSendingInvitation(true);

      const payload = {
        invitedRole: "EMPLOYEE",
        employmentCode: code,
        employeeName: name,
        email,
        phone: phone || null,
        department: invitationForm.department.trim() || null,
        designation: invitationForm.designation.trim() || null,
        managerName: invitationForm.manager.trim() || null,
        dateOfJoining: invitationForm.joined || null,
      };

      await invitationService.sendInvitation(payload);

      setModal(null);
      setInvitationForm(emptyInvitationForm);
      setFormError("");

      await fetchInvitations();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSendingInvitation(false);
    }
  };

  // Update an existing employee.
  const saveEmployee = async (event) => {
    event.preventDefault();
    setFormError("");

    const code = form.code.trim();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!code || !name || !email) {
      setFormError("Employment code, name and email are required.");
      return;
    }

    const duplicateCode = employees.some(
      (employee) =>
        String(employee.code || "").toLowerCase() === code.toLowerCase() &&
        employee.id !== selectedEmployee?.id,
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        String(employee.email || "").toLowerCase() === email.toLowerCase() &&
        employee.id !== selectedEmployee?.id,
    );

    if (duplicateEmail) {
      setFormError("This company email already exists.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      if (!selectedEmployee?.id) {
        setFormError("Employee ID is missing.");
        return;
      }

      const { url, params } = getEmployeeApiUrl(selectedEmployee.id);

      const payload = {
        code,
        name,
        email,
        phone: phone || null,
        department: form.department.trim() || null,
        designation: form.designation.trim() || null,
        manager: form.manager.trim() || null,
        joined: form.joined || null,
        status: form.status,
      };

      await axiosInstance.put(url, payload, { params });

      setModal(null);
      setSelectedEmployee(null);
      setForm(emptyForm);

      await fetchEmployees();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Deactivate an existing employee.
  const deleteEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${employee.name}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee.id);
      setApiError("");

      const { url, params } = getEmployeeApiUrl(employee.id);

      await axiosInstance.delete(url, { params });

      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id ? { ...item, status: "Inactive" } : item,
        ),
      );

      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee({
          ...selectedEmployee,
          status: "Inactive",
        });
      }
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  // Revoke a pending employee invitation.
  const revokeInvitation = async (invitation) => {
    const invitationId = getInvitationId(invitation);

    if (!invitationId) {
      setApiError("Invitation ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to revoke the invitation sent to ${invitation.email}?`,
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

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInvitationStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "invitation-status-pending";
      case "ACCEPTED":
        return "invitation-status-accepted";
      case "EXPIRED":
        return "invitation-status-expired";
      case "REVOKED":
        return "invitation-status-revoked";
      default:
        return "";
    }
  };

  const getInvitationEmployeeName = (invitation) =>
    invitation.employeeName || invitation.name || "-";

  return (
    <div className="manage-employees-page">
      <div className="employees-heading">
        <div>
          <span className="employees-eyebrow">ORGANIZATION MANAGEMENT</span>
          <h1>Manage Employees</h1>
          <p>
            Manage employee records and invite employees to join your
            organization.
          </p>
        </div>

        <div className="employees-heading-actions">
          <button
            type="button"
            className="employee-refresh-btn"
            onClick={refreshPage}
            disabled={loading || sendingInvitation}
            title="Refresh employees and invitations"
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            className="employees-primary-btn"
            onClick={openAdd}
          >
            <Send size={17} />
            Invite Employee
          </button>
        </div>
      </div>

      {apiError && (
        <div className="employee-api-error" role="alert">
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

      <div className="employees-summary">
        <div className="employees-summary-card">
          <div className="employees-summary-icon">
            <Users size={21} />
          </div>
          <div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>
        </div>

        <div className="employees-summary-card">
          <div className="employees-summary-icon employees-active-icon">
            <UserCheck size={21} />
          </div>
          <div>
            <span>Active Employees</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="employees-summary-card">
          <div className="employees-summary-icon employees-inactive-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending Invitations</span>
            <strong>{pendingInvitationCount}</strong>
          </div>
        </div>
      </div>

      <div className="employees-table-card">
        <div className="employees-toolbar">
          <div>
            <h2>Employee Directory</h2>
            <p>Manage your organization's employee records.</p>
          </div>

          <div className="employees-filters">
            <div className="employees-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
        </div>

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>EMPLOYMENT CODE</th>
                <th>DEPARTMENT</th>
                <th>DESIGNATION</th>
                <th>REPORTING MANAGER</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="employees-empty">Loading employees...</div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-person">
                        <div className="employee-avatar">
                          {(employee.name || "E").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{displayValue(employee.name)}</strong>
                          <span>{displayValue(employee.email)}</span>
                        </div>
                      </div>
                    </td>

                    <td>{displayValue(employee.code)}</td>
                    <td>{displayValue(employee.department)}</td>
                    <td>{displayValue(employee.designation)}</td>
                    <td>{displayValue(employee.manager)}</td>

                    <td>
                      <span
                        className={`employee-status ${
                          employee.status === "Active"
                            ? "employee-status-active"
                            : "employee-status-inactive"
                        }`}
                      >
                        {displayValue(employee.status)}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">
                        <button
                          type="button"
                          title="View"
                          onClick={() => openView(employee)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Deactivate"
                          className="employee-delete-action"
                          onClick={() => deleteEmployee(employee)}
                          disabled={
                            employee.status === "Inactive" ||
                            deletingId === employee.id
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="employees-empty">
                      <Users size={30} />
                      <strong>No employees found</strong>
                      <span>Try another search or invite a new employee.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="employees-table-footer">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee invitations */}
      <div className="employees-table-card employee-invitations-card">
        <div className="employees-toolbar">
          <div>
            <h2>Employee Invitations</h2>
            <p>
              Track invitations sent to employees and manage pending
              invitations.
            </p>
          </div>

          <span className="invitation-count">
            {invitations.length} invitation
            {invitations.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="employees-table-wrapper">
          <table className="employees-table invitations-table">
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>EMPLOYMENT CODE</th>
                <th>DEPARTMENT</th>
                <th>INVITED ON</th>
                <th>EXPIRES ON</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
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
                        <div className="employee-person">
                          <div className="employee-avatar invitation-avatar">
                            {getInvitationEmployeeName(invitation)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <strong>
                              {getInvitationEmployeeName(invitation)}
                            </strong>
                            <span>{displayValue(invitation.email)}</span>
                          </div>
                        </div>
                      </td>

                      <td>{displayValue(invitation.employmentCode)}</td>
                      <td>{displayValue(invitation.department)}</td>
                      <td>{formatDate(invitation.createdAt)}</td>
                      <td>{formatDate(invitation.expiresAt)}</td>

                      <td>
                        <span
                          className={`invitation-status ${getInvitationStatusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {status === "PENDING" ? (
                          <div className="employee-actions">
                            <button
                              type="button"
                              title="Revoke invitation"
                              className="invitation-revoke-action"
                              onClick={() => revokeInvitation(invitation)}
                              disabled={revokingId === invitationId}
                            >
                              <Ban size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="invitation-no-action">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="employees-empty invitation-empty">
                      <Mail size={29} />
                      <strong>No employee invitations yet</strong>
                      <span>
                        Use Invite Employee to send an invitation by email.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving &&
              !sendingInvitation
            ) {
              setModal(null);
            }
          }}
        >
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>
                  {modal === "invite"
                    ? "Invite Employee"
                    : modal === "edit"
                      ? "Edit Employee"
                      : "Employee Details"}
                </h2>
                <p>
                  {modal === "invite"
                    ? "Send an email invitation so the employee can create their account."
                    : modal === "view"
                      ? "Employee information"
                      : "Update the employee details below."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close"
                disabled={saving || sendingInvitation}
              >
                <X size={20} />
              </button>
            </div>

            {modal === "view" && selectedEmployee ? (
              <div className="employee-details">
                <div className="employee-details-avatar">
                  {(selectedEmployee.name || "E").charAt(0).toUpperCase()}
                </div>

                <h3>{displayValue(selectedEmployee.name)}</h3>

                <span
                  className={`employee-status ${
                    selectedEmployee.status === "Active"
                      ? "employee-status-active"
                      : "employee-status-inactive"
                  }`}
                >
                  {displayValue(selectedEmployee.status)}
                </span>

                <div className="employee-detail-grid">
                  <div>
                    <span>Employment Code</span>
                    <strong>{displayValue(selectedEmployee.code)}</strong>
                  </div>
                  <div>
                    <span>Department</span>
                    <strong>{displayValue(selectedEmployee.department)}</strong>
                  </div>
                  <div>
                    <span>Designation</span>
                    <strong>
                      {displayValue(selectedEmployee.designation)}
                    </strong>
                  </div>
                  <div>
                    <span>Reporting Manager</span>
                    <strong>{displayValue(selectedEmployee.manager)}</strong>
                  </div>
                  <div>
                    <span>Company Email</span>
                    <strong>{displayValue(selectedEmployee.email)}</strong>
                  </div>
                  <div>
                    <span>Mobile Number</span>
                    <strong>{displayValue(selectedEmployee.phone)}</strong>
                  </div>
                  <div>
                    <span>Date of Joining</span>
                    <strong>
                      {formatDate(
                        selectedEmployee.joined || selectedEmployee.createdAt,
                      )}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="employees-primary-btn employee-view-edit"
                  onClick={() => openEdit(selectedEmployee)}
                >
                  <Pencil size={16} />
                  Edit Employee
                </button>
              </div>
            ) : modal === "invite" ? (
              <form className="employee-form" onSubmit={sendEmployeeInvitation}>
                <label>
                  Employment Code *
                  <input
                    name="code"
                    value={invitationForm.code}
                    onChange={updateInvitationField}
                    placeholder="Example: EMP004"
                    maxLength={20}
                    required
                  />
                </label>

                <label>
                  Employee Name *
                  <input
                    name="name"
                    value={invitationForm.name}
                    onChange={updateInvitationField}
                    placeholder="Enter employee name"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Company Email *
                  <input
                    type="email"
                    name="email"
                    value={invitationForm.email}
                    onChange={updateInvitationField}
                    placeholder="employee@company.com"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    name="phone"
                    value={invitationForm.phone}
                    onChange={updateInvitationField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>

                <label>
                  Department
                  <input
                    name="department"
                    value={invitationForm.department}
                    onChange={updateInvitationField}
                    placeholder="Enter department"
                    maxLength={100}
                  />
                </label>

                <label>
                  Designation
                  <input
                    name="designation"
                    value={invitationForm.designation}
                    onChange={updateInvitationField}
                    placeholder="Enter designation"
                    maxLength={100}
                  />
                </label>

                <label>
                  Reporting Manager
                  <input
                    name="manager"
                    value={invitationForm.manager}
                    onChange={updateInvitationField}
                    placeholder="Manager name"
                    maxLength={150}
                  />
                </label>

                <label>
                  Date of Joining
                  <input
                    type="date"
                    name="joined"
                    value={invitationForm.joined}
                    onChange={updateInvitationField}
                  />
                </label>

                <p className="employee-form-hint employee-form-full">
                  The employee will receive an invitation email. They can use
                  the link in that email to set their password and activate
                  their account.
                </p>

                {formError && (
                  <p className="employee-form-error">{formError}</p>
                )}

                <div className="employee-form-actions">
                  <button
                    type="button"
                    className="employee-cancel-btn"
                    onClick={() => setModal(null)}
                    disabled={sendingInvitation}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="employees-primary-btn"
                    disabled={sendingInvitation}
                  >
                    <Send size={16} />
                    {sendingInvitation
                      ? "Sending Invitation..."
                      : "Send Invitation"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="employee-form" onSubmit={saveEmployee}>
                <label>
                  Employment Code *
                  <input
                    name="code"
                    value={form.code}
                    onChange={updateField}
                    placeholder="Example: EMP004"
                    required
                  />
                </label>

                <label>
                  Full Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Enter employee name"
                    required
                  />
                </label>

                <label>
                  Company Email *
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="employee@company.com"
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>

                <label>
                  Department
                  <input
                    name="department"
                    value={form.department}
                    onChange={updateField}
                    placeholder="Enter department"
                  />
                </label>

                <label>
                  Designation
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={updateField}
                    placeholder="Enter designation"
                  />
                </label>

                <label>
                  Reporting Manager
                  <input
                    name="manager"
                    value={form.manager}
                    onChange={updateField}
                    placeholder="Manager name"
                  />
                </label>

                <label>
                  Date of Joining
                  <input
                    type="date"
                    name="joined"
                    value={form.joined}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Account Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                {formError && (
                  <p className="employee-form-error">{formError}</p>
                )}

                <div className="employee-form-actions">
                  <button
                    type="button"
                    className="employee-cancel-btn"
                    onClick={() => setModal(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="employees-primary-btn"
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

export default ManageEmployees;
