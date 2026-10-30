
import { useMemo, useState } from "react";
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
  Mail,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
} from "lucide-react";
import "./ManageEmployees.css";

const initialEmployees = [
  {
    id: 1,
    code: "EMP001",
    name: "Arjun Kumar",
    email: "arjun@orgconnect.com",
    phone: "9876543210",
    department: "Engineering",
    designation: "Software Developer",
    manager: "Rahul Sharma",
    joined: "2025-06-10",
    status: "Active",
  },
  {
    id: 2,
    code: "EMP002",
    name: "Sneha Reddy",
    email: "sneha@orgconnect.com",
    phone: "9876543211",
    department: "Human Resources",
    designation: "HR Executive",
    manager: "Priya Reddy",
    joined: "2025-08-15",
    status: "Active",
  },
  {
    id: 3,
    code: "EMP003",
    name: "Vikram Singh",
    email: "vikram@orgconnect.com",
    phone: "9876543212",
    department: "Finance",
    designation: "Accountant",
    manager: "Kiran Kumar",
    joined: "2024-11-20",
    status: "Inactive",
  },
];

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

function ManageEmployees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const departments = useMemo(
    () => [...new Set(employees.map((employee) => employee.department))],
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        employee.code,
        employee.name,
        employee.email,
        employee.department,
        employee.designation,
        employee.manager,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, search, statusFilter, departmentFilter]);

  const openAdd = () => {
    setForm(emptyForm);
    setSelectedEmployee(null);
    setFormError("");
    setModal("add");
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setForm({ ...employee });
    setFormError("");
    setModal("edit");
  };

  const openView = (employee) => {
    setSelectedEmployee(employee);
    setModal("view");
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveEmployee = (event) => {
    event.preventDefault();
    setFormError("");

    const duplicateCode = employees.some(
      (employee) =>
        employee.code.toLowerCase() === form.code.trim().toLowerCase() &&
        employee.id !== selectedEmployee?.id
    );

    if (duplicateCode) {
      setFormError("This employment code already exists.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        employee.email.toLowerCase() === form.email.trim().toLowerCase() &&
        employee.id !== selectedEmployee?.id
    );

    if (duplicateEmail) {
      setFormError("This company email already exists.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (modal === "add") {
      setEmployees((current) => [
        {
          ...form,
          id: Date.now(),
          code: form.code.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
        },
        ...current,
      ]);
    } else {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === selectedEmployee.id
            ? {
                ...employee,
                ...form,
                code: form.code.trim(),
                name: form.name.trim(),
                email: form.email.trim(),
              }
            : employee
        )
      );
    }

    setModal(null);
  };

  const deleteEmployee = (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`
    );

    if (confirmed) {
      setEmployees((current) =>
        current.filter((item) => item.id !== employee.id)
      );
    }
  };

  return (
    <div className="manage-employees-page">
      <div className="employees-heading">
        <div>
          <span className="employees-eyebrow">ORGANIZATION MANAGEMENT</span>
          <h1>Manage Employees</h1>
          <p>View and manage employee information in your organization.</p>
        </div>

        <button className="employees-primary-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

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
            <strong>
              {employees.filter((item) => item.status === "Active").length}
            </strong>
          </div>
        </div>

        <div className="employees-summary-card">
          <div className="employees-summary-icon employees-inactive-icon">
            <UserX size={21} />
          </div>
          <div>
            <span>Inactive Employees</span>
            <strong>
              {employees.filter((item) => item.status === "Inactive").length}
            </strong>
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
                <button onClick={() => setSearch("")} aria-label="Clear search">
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
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-person">
                      <div className="employee-avatar">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{employee.code}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.manager}</td>
                  <td>
                    <span
                      className={`employee-status ${
                        employee.status === "Active"
                          ? "employee-status-active"
                          : "employee-status-inactive"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className="employee-actions">
                      <button title="View" onClick={() => openView(employee)}>
                        <Eye size={17} />
                      </button>
                      <button title="Edit" onClick={() => openEdit(employee)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Delete"
                        className="employee-delete-action"
                        onClick={() => deleteEmployee(employee)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="employees-empty">
                      <Users size={30} />
                      <strong>No employees found</strong>
                      <span>Try another search or add a new employee.</span>
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
            if (event.target === event.currentTarget) setModal(null);
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
              <button onClick={() => setModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {modal === "view" ? (
              <div className="employee-details">
                <div className="employee-details-avatar">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <h3>{selectedEmployee.name}</h3>
                <span className={`employee-status ${
                  selectedEmployee.status === "Active"
                    ? "employee-status-active"
                    : "employee-status-inactive"
                }`}>
                  {selectedEmployee.status}
                </span>

                <div className="employee-detail-grid">
                  <div><span>Employment Code</span><strong>{selectedEmployee.code}</strong></div>
                  <div><span>Department</span><strong>{selectedEmployee.department}</strong></div>
                  <div><span>Designation</span><strong>{selectedEmployee.designation}</strong></div>
                  <div><span>Reporting Manager</span><strong>{selectedEmployee.manager}</strong></div>
                  <div><span>Company Email</span><strong>{selectedEmployee.email}</strong></div>
                  <div><span>Mobile Number</span><strong>{selectedEmployee.phone}</strong></div>
                  <div><span>Date of Joining</span><strong>{selectedEmployee.joined}</strong></div>
                </div>

                <button
                  className="employees-primary-btn employee-view-edit"
                  onClick={() => openEdit(selectedEmployee)}
                >
                  <Pencil size={16} /> Edit Employee
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

                <label>
                  Mobile Number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    required
                  />
                </label>

                <label>
                  Department *
                  <input
                    name="department"
                    value={form.department}
                    onChange={updateField}
                    placeholder="Enter department"
                    required
                  />
                </label>

                <label>
                  Designation *
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={updateField}
                    placeholder="Enter designation"
                    required
                  />
                </label>

                <label>
                  Reporting Manager *
                  <input
                    name="manager"
                    value={form.manager}
                    onChange={updateField}
                    placeholder="Manager name"
                    required
                  />
                </label>

                <label>
                  Date of Joining *
                  <input
                    type="date"
                    name="joined"
                    value={form.joined}
                    onChange={updateField}
                    required
                  />
                </label>

                <label>
                  Account Status
                  <select name="status" value={form.status} onChange={updateField}>
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
                  >
                    Cancel
                  </button>
                  <button type="submit" className="employees-primary-btn">
                    {modal === "add" ? "Add Employee" : "Save Changes"}
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
