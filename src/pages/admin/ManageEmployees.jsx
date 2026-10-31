import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  UserCheck,
  UserX,
  X,
  Users,
} from "lucide-react";

const initialEmployees = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "Rahul Sharma",
    email: "rahul@demo.com",
    department: "Engineering",
    designation: "Software Developer",
    joiningDate: "2025-01-15",
    status: "Active",
  },
  {
    id: 2,
    employeeId: "EMP002",
    name: "Priya Reddy",
    email: "priya@demo.com",
    department: "Human Resources",
    designation: "HR Executive",
    joiningDate: "2025-03-10",
    status: "Active",
  },
  {
    id: 3,
    employeeId: "EMP003",
    name: "Arjun Kumar",
    email: "arjun@demo.com",
    department: "Finance",
    designation: "Accountant",
    joiningDate: "2024-11-20",
    status: "Inactive",
  },
  {
    id: 4,
    employeeId: "EMP004",
    name: "Sneha Rao",
    email: "sneha@demo.com",
    department: "Engineering",
    designation: "UI Developer",
    joiningDate: "2025-06-05",
    status: "Active",
  },
];

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  department: "",
  designation: "",
  joiningDate: "",
  status: "Active",
};

export default function ManageEmployees() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const departments = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
  ];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.employeeId.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const inactiveCount = employees.length - activeCount;

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      employeeId: `EMP${String(employees.length + 1).padStart(3, "0")}`,
    });
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setEditingId(employee.id);
    setForm({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      status: employee.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingId
            ? { ...employee, ...form }
            : employee
        )
      );
    } else {
      setEmployees((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...form,
        },
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleStatus = (id) => {
    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              status:
                employee.status === "Active" ? "Inactive" : "Active",
            }
          : employee
      )
    );
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

        .me-status.active {
          background: #e7f8ef;
          color: #16834b;
        }

        .me-status.inactive {
          background: #fceaea;
          color: #c43d3d;
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
          max-width: 560px;
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
          margin-bottom: 22px;
        }

        .me-modal-header h3 {
          margin: 0;
          font-size: 20px;
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
        }

        .me-form-field.full {
          grid-column: 1 / -1;
        }

        .me-form-field label {
          font-size: 13px;
          font-weight: 600;
        }

        .me-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
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

          .me-form-field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="me-heading">
        <div>
          <h2>Manage Employees</h2>
          <p>Add, view, edit and manage employees in your company.</p>
        </div>

        <button className="me-primary-btn" onClick={openAddModal}>
          <Plus size={17} />
          Add Employee
        </button>
      </div>

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
          <div className="me-stat-label">Inactive Employees</div>
          <div className="me-stat-value">{inactiveCount}</div>
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
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="me-employee-name">{employee.name}</div>
                    <div className="me-muted">{employee.email}</div>
                  </td>
                  <td>{employee.employeeId}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{employee.joiningDate || "—"}</td>
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
                        className="me-icon-btn"
                        title="Edit employee"
                        onClick={() => openEditModal(employee)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="me-icon-btn"
                        title={
                          employee.status === "Active"
                            ? "Deactivate employee"
                            : "Activate employee"
                        }
                        onClick={() => toggleStatus(employee.id)}
                      >
                        {employee.status === "Active" ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
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

      {showModal && (
        <div
          className="me-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="me-modal">
            <div className="me-modal-header">
              <h3>{editingId ? "Edit Employee" : "Add Employee"}</h3>
              <button
                className="me-icon-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="me-form-grid">
                <div className="me-form-field">
                  <label>Employee ID</label>
                  <input
                    className="me-input"
                    value={form.employeeId}
                    onChange={(event) =>
                      setForm({ ...form, employeeId: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="me-form-field">
                  <label>Full Name</label>
                  <input
                    className="me-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="me-form-field full">
                  <label>Email Address</label>
                  <input
                    className="me-input"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="me-form-field">
                  <label>Department</label>
                  <select
                    className="me-select"
                    value={form.department}
                    onChange={(event) =>
                      setForm({ ...form, department: event.target.value })
                    }
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="me-form-field">
                  <label>Designation</label>
                  <input
                    className="me-input"
                    value={form.designation}
                    onChange={(event) =>
                      setForm({ ...form, designation: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="me-form-field">
                  <label>Joining Date</label>
                  <input
                    className="me-input"
                    type="date"
                    value={form.joiningDate}
                    onChange={(event) =>
                      setForm({ ...form, joiningDate: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="me-form-field">
                  <label>Status</label>
                  <select
                    className="me-select"
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="me-form-actions">
                <button
                  type="button"
                  className="me-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="me-primary-btn">
                  {editingId ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}