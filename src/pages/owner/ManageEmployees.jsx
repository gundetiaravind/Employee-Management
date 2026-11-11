
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
} from "lucide-react";
const AUTH_KEY = "orgconnect-auth";
import axiosInstance from "../../utils/axiosInstance";
import "./ManageEmployees.css";

// Read authenticated user
  const user = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(AUTH_KEY) || "null"
      );
    } catch {
      return null;
    }
  })();

// const COMPANY_ID = 1;
console.log(user);
const COMPANY_ID = user?.companyId;
// console.log(COMPANY_ID);
// alert(COMPANY_ID);

//alert(sessionStorage.getItem(companyId));
//return false;
const API = {
  employees: `/api/company-owner/employees?companyId=${COMPANY_ID}`,
  create: `/api/company-owner/employees?companyId=${COMPANY_ID}`,
  update: (id) => `/api/company/employees/${id}?companyId=${COMPANY_ID}`,
  delete: (id) => `/api/company/employees/${id}?companyId=${COMPANY_ID}`,
};

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

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const displayValue = (value) => value || "-";

function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // GET: Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setApiError("");

      const response = await axiosInstance.get(API.employees);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.employees || [];

      setEmployees(data);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const departments = useMemo(
    () =>
      [
        ...new Set(
          employees
            .map((employee) => employee.department)
            .filter(Boolean)
        ),
      ],
    [employees]
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
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const inactiveCount = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const openAdd = () => {
    setForm(emptyForm);
    setSelectedEmployee(null);
    setFormError("");
    setModal("add");
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

  // POST: Create employee
  // PUT: Update employee
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
        employee.id !== selectedEmployee?.id
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        String(employee.email || "").toLowerCase() === email.toLowerCase() &&
        employee.id !== selectedEmployee?.id
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

      if (modal === "add") {
        // Your POST API currently accepts these three fields.
        const payload = {
          code,
          name,
          email,
        };

        await axiosInstance.post(API.create, payload);
      } else if (modal === "edit") {
        if (!selectedEmployee?.id) {
          setFormError("Employee ID is missing.");
          return;
        }

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

        await axiosInstance.put(
          API.update(selectedEmployee.id),
          payload
        );
      }

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

  // DELETE: Backend deactivates employee instead of permanently deleting
  const deleteEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${employee.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee.id);
      setApiError("");

      await axiosInstance.delete(API.delete(employee.id));

      // Reflect the deactivation in the UI.
      setEmployees((current) =>
        current.map((item) =>
          item.id === employee.id
            ? { ...item, status: "Inactive" }
            : item
        )
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

  return (
    <div className="manage-employees-page">
      <div className="employees-heading">
        <div>
          <span className="employees-eyebrow">
            ORGANIZATION MANAGEMENT
          </span>
          <h1>Manage Employees</h1>
          <p>
            View and manage employee information in your organization.
          </p>
        </div>

        <div className="employees-heading-actions">
          <button
            type="button"
            className="employee-refresh-btn"
            onClick={fetchEmployees}
            disabled={loading}
            title="Refresh employees"
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            className="employees-primary-btn"
            onClick={openAdd}
          >
            <Plus size={18} />
            Add Employee
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
            <UserX size={21} />
          </div>
          <div>
            <span>Inactive Employees</span>
            <strong>{inactiveCount}</strong>
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
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
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
                    <div className="employees-empty">
                      Loading employees...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-person">
                        <div className="employee-avatar">
                          {(employee.name || "E")
                            .charAt(0)
                            .toUpperCase()}
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
                      <span>
                        Try another search or add a new employee.
                      </span>
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

      {modal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModal(null);
            }
          }}
        >
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>
                  {modal === "add"
                    ? "Add New Employee"
                    : modal === "edit"
                    ? "Edit Employee"
                    : "Employee Details"}
                </h2>
                <p>
                  {modal === "view"
                    ? "Employee information"
                    : "Enter the employee details below."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {modal === "view" && selectedEmployee ? (
              <div className="employee-details">
                <div className="employee-details-avatar">
                  {(selectedEmployee.name || "E")
                    .charAt(0)
                    .toUpperCase()}
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
                    <strong>{displayValue(selectedEmployee.designation)}</strong>
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
                        selectedEmployee.joined ||
                          selectedEmployee.createdAt
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

                {modal === "edit" && (
                  <>
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
                  </>
                )}

                {modal === "add" && (
                  <p className="employee-form-hint">
                    Additional employee details can be filled in after
                    creating the employee using Edit.
                  </p>
                )}

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
                    {saving
                      ? "Saving..."
                      : modal === "add"
                      ? "Add Employee"
                      : "Save Changes"}
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
