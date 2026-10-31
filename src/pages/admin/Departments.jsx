import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Building2,
  Users,
  X,
  Power,
} from "lucide-react";

const initialDepartments = [
  {
    id: 1,
    name: "Engineering",
    code: "ENG",
    description: "Software development and technical operations.",
    manager: "Rahul Sharma",
    employees: 35,
    status: "Active",
  },
  {
    id: 2,
    name: "Human Resources",
    code: "HR",
    description: "Employee relations and recruitment.",
    manager: "Priya Reddy",
    employees: 12,
    status: "Active",
  },
  {
    id: 3,
    name: "Finance",
    code: "FIN",
    description: "Financial planning and accounting.",
    manager: "Arjun Kumar",
    employees: 10,
    status: "Active",
  },
  {
    id: 4,
    name: "Marketing",
    code: "MKT",
    description: "Marketing campaigns and brand management.",
    manager: "Sneha Rao",
    employees: 8,
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
  manager: "",
  status: "Active",
};

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const activeCount = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const inactiveCount = departments.length - activeCount;

  const totalEmployees = departments.reduce(
    (total, department) => total + Number(department.employees || 0),
    0
  );

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const value = search.toLowerCase();

      const matchesSearch =
        department.name.toLowerCase().includes(value) ||
        department.code.toLowerCase().includes(value) ||
        department.manager.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" || department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingId(department.id);
    setForm({
      name: department.name,
      code: department.code,
      description: department.description,
      manager: department.manager,
      status: department.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const duplicate = departments.some(
      (department) =>
        department.code.toLowerCase() === form.code.trim().toLowerCase() &&
        department.id !== editingId
    );

    if (duplicate) {
      alert("This department code already exists.");
      return;
    }

    if (editingId) {
      setDepartments((previous) =>
        previous.map((department) =>
          department.id === editingId
            ? { ...department, ...form }
            : department
        )
      );
    } else {
      setDepartments((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...form,
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          manager: form.manager.trim(),
          description: form.description.trim(),
          employees: 0,
        },
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setDepartments((previous) =>
      previous.map((department) =>
        department.id === id
          ? {
              ...department,
              status:
                department.status === "Active" ? "Inactive" : "Active",
            }
          : department
      )
    );
  };

  return (
    <div className="dept-page">
      <style>{`
        .dept-page {
          width: 100%;
          color: var(--text, #202536);
        }

        .dept-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .dept-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .dept-heading p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 14px;
        }

        .dept-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 17px;
          border: none;
          border-radius: 8px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .dept-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .dept-stat {
          padding: 20px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .dept-stat-label {
          color: var(--muted, #7a8192);
          font-size: 13px;
        }

        .dept-stat-value {
          margin-top: 8px;
          font-size: 26px;
          font-weight: 700;
        }

        .dept-toolbar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 17px;
        }

        .dept-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .dept-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }

        .dept-input,
        .dept-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }

        .dept-search .dept-input {
          padding-left: 40px;
        }

        .dept-filter {
          width: 180px;
        }

        .dept-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }

        .dept-table {
          width: 100%;
          min-width: 750px;
          border-collapse: collapse;
        }

        .dept-table th,
        .dept-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .dept-table th {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-weight: 600;
        }

        .dept-table tbody tr:last-child td {
          border-bottom: none;
        }

        .dept-name {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .dept-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
        }

        .dept-muted {
          color: var(--muted, #7a8192);
          font-size: 12px;
        }

        .dept-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .dept-status.active {
          background: #e7f8ef;
          color: #16834b;
        }

        .dept-status.inactive {
          background: #fceaea;
          color: #c43d3d;
        }

        .dept-actions {
          display: flex;
          gap: 8px;
        }

        .dept-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 7px;
          background: var(--card, white);
          color: var(--text, #202536);
          cursor: pointer;
        }

        .dept-icon-btn:hover {
          color: var(--primary, #6558d3);
          border-color: var(--primary, #6558d3);
        }

        .dept-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }

        .dept-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, .45);
        }

        .dept-modal {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 14px;
          background: var(--card, white);
          color: var(--text, #202536);
        }

        .dept-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .dept-modal-header h3 {
          margin: 0;
        }

        .dept-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .dept-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .dept-field.full {
          grid-column: 1 / -1;
        }

        .dept-field label {
          font-size: 13px;
          font-weight: 600;
        }

        .dept-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .dept-cancel-btn {
          padding: 10px 16px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--text, #202536);
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .dept-stats {
            grid-template-columns: 1fr;
          }

          .dept-filter {
            width: 100%;
          }

          .dept-form-grid {
            grid-template-columns: 1fr;
          }

          .dept-field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="dept-heading">
        <div>
          <h2>Departments</h2>
          <p>Create and manage departments within your company.</p>
        </div>

        <button className="dept-primary-btn" onClick={openAddModal}>
          <Plus size={17} />
          Add Department
        </button>
      </div>

      <div className="dept-stats">
        <div className="dept-stat">
          <div className="dept-stat-label">Total Departments</div>
          <div className="dept-stat-value">{departments.length}</div>
        </div>

        <div className="dept-stat">
          <div className="dept-stat-label">Active Departments</div>
          <div className="dept-stat-value">{activeCount}</div>
        </div>

        <div className="dept-stat">
          <div className="dept-stat-label">Employees Assigned</div>
          <div className="dept-stat-value">{totalEmployees}</div>
        </div>
      </div>

      <div className="dept-toolbar">
        <div className="dept-search">
          <Search size={17} />
          <input
            className="dept-input"
            placeholder="Search department, code or manager..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="dept-select dept-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="dept-table-wrap">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Code</th>
              <th>Manager</th>
              <th>Employees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDepartments.length ? (
              filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td>
                    <div className="dept-name">
                      <span className="dept-icon">
                        <Building2 size={17} />
                      </span>
                      <span>{department.name}</span>
                    </div>
                    <div className="dept-muted" style={{ marginTop: 5 }}>
                      {department.description}
                    </div>
                  </td>

                  <td>{department.code}</td>
                  <td>{department.manager || "Not assigned"}</td>
                  <td>
                    <span style={{ display: "inline-flex", gap: 6 }}>
                      <Users size={15} />
                      {department.employees}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`dept-status ${department.status.toLowerCase()}`}
                    >
                      {department.status}
                    </span>
                  </td>

                  <td>
                    <div className="dept-actions">
                      <button
                        className="dept-icon-btn"
                        title="Edit department"
                        onClick={() => openEditModal(department)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="dept-icon-btn"
                        title={
                          department.status === "Active"
                            ? "Deactivate department"
                            : "Activate department"
                        }
                        onClick={() => toggleStatus(department.id)}
                      >
                        <Power size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="dept-empty">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="dept-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="dept-modal">
            <div className="dept-modal-header">
              <h3>{editingId ? "Edit Department" : "Add Department"}</h3>

              <button
                className="dept-icon-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dept-form-grid">
                <div className="dept-field">
                  <label>Department Name</label>
                  <input
                    className="dept-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="dept-field">
                  <label>Department Code</label>
                  <input
                    className="dept-input"
                    value={form.code}
                    onChange={(event) =>
                      setForm({ ...form, code: event.target.value })
                    }
                    required
                  />
                </div>

                <div className="dept-field full">
                  <label>Description</label>
                  <input
                    className="dept-input"
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Department responsibilities"
                  />
                </div>

                <div className="dept-field">
                  <label>Department Manager</label>
                  <input
                    className="dept-input"
                    value={form.manager}
                    onChange={(event) =>
                      setForm({ ...form, manager: event.target.value })
                    }
                    placeholder="Manager name"
                  />
                </div>

                <div className="dept-field">
                  <label>Status</label>
                  <select
                    className="dept-select"
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

              <div className="dept-form-actions">
                <button
                  type="button"
                  className="dept-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="dept-primary-btn">
                  {editingId ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}