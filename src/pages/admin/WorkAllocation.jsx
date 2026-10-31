import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  Users,
  Clock,
  CheckCircle,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  ChartNoAxesCombined,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

import "./WorkAllocation.css";

const initialWork = [
  {
    id: 1,
    title: "Website Dashboard Development",
    description: "Develop and complete the employee dashboard module.",
    employee: "Rahul Sharma",
    employeeId: "EMP001",
    department: "IT",
    priority: "High",
    startDate: "2026-10-20",
    dueDate: "2026-11-05",
    progress: 70,
    status: "In Progress",
  },
  {
    id: 2,
    title: "Monthly Financial Report",
    description: "Prepare and verify the monthly financial report.",
    employee: "Priya Reddy",
    employeeId: "EMP002",
    department: "Finance",
    priority: "Medium",
    startDate: "2026-10-25",
    dueDate: "2026-11-08",
    progress: 40,
    status: "In Progress",
  },
  {
    id: 3,
    title: "Employee Documentation",
    description: "Review and organize employee onboarding documents.",
    employee: "Arjun Kumar",
    employeeId: "EMP003",
    department: "HR",
    priority: "Low",
    startDate: "2026-10-28",
    dueDate: "2026-11-10",
    progress: 0,
    status: "Assigned",
  },
  {
    id: 4,
    title: "API Integration",
    description: "Complete the API integration and testing.",
    employee: "Sneha Rao",
    employeeId: "EMP004",
    department: "IT",
    priority: "High",
    startDate: "2026-10-15",
    dueDate: "2026-10-29",
    progress: 100,
    status: "Completed",
  },
];

const employees = [
  { id: "EMP001", name: "Rahul Sharma", department: "IT" },
  { id: "EMP002", name: "Priya Reddy", department: "Finance" },
  { id: "EMP003", name: "Arjun Kumar", department: "HR" },
  { id: "EMP004", name: "Sneha Rao", department: "IT" },
  { id: "EMP005", name: "Kiran Kumar", department: "Sales" },
];

const emptyForm = {
  title: "",
  description: "",
  employeeId: "",
  priority: "Medium",
  startDate: "",
  dueDate: "",
  progress: 0,
  status: "Assigned",
};

const statusOptions = [
  "Assigned",
  "In Progress",
  "Completed",
  "On Hold",
];

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorkAllocation() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("allocation");
  const [workItems, setWorkItems] = useState(initialWork);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredWork = useMemo(() => {
    return workItems.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchText) ||
        item.employee.toLowerCase().includes(searchText) ||
        item.employeeId.toLowerCase().includes(searchText) ||
        item.department.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        item.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [workItems, search, statusFilter, departmentFilter]);

  const stats = useMemo(
    () => ({
      total: workItems.length,
      assigned: workItems.filter(
        (item) => item.status === "Assigned"
      ).length,
      inProgress: workItems.filter(
        (item) => item.status === "In Progress"
      ).length,
      completed: workItems.filter(
        (item) => item.status === "Completed"
      ).length,
    }),
    [workItems]
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      employeeId: item.employeeId,
      priority: item.priority,
      startDate: item.startDate,
      dueDate: item.dueDate,
      progress: item.progress,
      status: item.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const selectedEmployee = employees.find(
      (employee) => employee.id === form.employeeId
    );

    if (!selectedEmployee) {
      alert("Please select an employee.");
      return;
    }

    if (form.dueDate < form.startDate) {
      alert("Due date cannot be earlier than the start date.");
      return;
    }

    const progress = Number(form.progress);

    const status =
      progress === 100 || form.status === "Completed"
        ? "Completed"
        : form.status;

    const workData = {
      ...form,
      progress: status === "Completed" ? 100 : progress,
      status,
      employee: selectedEmployee.name,
      employeeId: selectedEmployee.id,
      department: selectedEmployee.department,
    };

    if (editingId !== null) {
      setWorkItems((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, ...workData }
            : item
        )
      );
    } else {
      setWorkItems((previous) => [
        ...previous,
        {
          id: Date.now(),
          ...workData,
        },
      ]);
    }

    closeModal();
  };

  const updateProgress = (id, value) => {
    const progress = Number(value);

    setWorkItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          progress,
          status:
            progress === 100
              ? "Completed"
              : progress > 0
                ? "In Progress"
                : "Assigned",
        };
      })
    );
  };

  const updateStatus = (id, status) => {
    setWorkItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          status,
          progress:
            status === "Completed"
              ? 100
              : item.progress === 100
                ? 0
                : item.progress,
        };
      })
    );
  };

  const deleteWork = (id) => {
    if (window.confirm("Are you sure you want to delete this work item?")) {
      setWorkItems((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const getStatusClass = (status) =>
    status.toLowerCase().replaceAll(" ", "-");

  return (
    <div className={`work-page ${isDark ? "dark" : "light"}`}>
      <div className="work-header">
        <div className="work-heading">
          <h1>Work Allocation</h1>
          <p>Assign work to employees and track their progress.</p>
        </div>

        <button className="work-primary-btn" onClick={openAddModal}>
          <Plus size={17} />
          Assign New Work
        </button>
      </div>

      <div className="work-stats">
        <div className="work-stat">
          <div className="work-stat-icon purple">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <strong>{stats.total}</strong>
            <span>Total Work Items</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon blue">
            <ClipboardList size={21} />
          </div>
          <div>
            <strong>{stats.assigned}</strong>
            <span>Assigned</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon orange">
            <Clock size={21} />
          </div>
          <div>
            <strong>{stats.inProgress}</strong>
            <span>In Progress</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <div className="work-tabs">
        <button
          className={`work-tab ${
            activeTab === "allocation" ? "active" : ""
          }`}
          onClick={() => setActiveTab("allocation")}
        >
          <BriefcaseBusiness size={17} />
          Work Allocation
        </button>

        <button
          className={`work-tab ${
            activeTab === "tracking" ? "active" : ""
          }`}
          onClick={() => setActiveTab("tracking")}
        >
          <ChartNoAxesCombined size={17} />
          Employee Work Tracking
        </button>
      </div>

      <section className="work-panel">
        <div className="work-toolbar">
          <div className="work-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search work, employee or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="work-filter"
            value={departmentFilter}
            onChange={(event) =>
              setDepartmentFilter(event.target.value)
            }
          >
            <option value="All">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales</option>
          </select>

          <select
            className="work-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {activeTab === "allocation" ? (
          <div className="work-table-wrap">
            <table className="work-table">
              <thead>
                <tr>
                  <th>WORK ITEM</th>
                  <th>ASSIGNED EMPLOYEE</th>
                  <th>PRIORITY</th>
                  <th>START DATE</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredWork.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="work-title">{item.title}</div>
                      <div className="work-subtitle">
                        {item.description}
                      </div>
                    </td>

                    <td>
                      <div className="work-employee">
                        {item.employee}
                      </div>
                      <small className="work-subtitle">
                        {item.employeeId} · {item.department}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`work-priority ${item.priority.toLowerCase()}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td>{formatDate(item.startDate)}</td>
                    <td>{formatDate(item.dueDate)}</td>

                    <td>
                      <span
                        className={`work-status ${getStatusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="work-actions">
                        <button
                          className="work-icon-btn"
                          title="Edit work"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="work-icon-btn delete"
                          title="Delete work"
                          onClick={() => deleteWork(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredWork.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      <div className="work-empty">
                        <BriefcaseBusiness size={30} />
                        <strong>No work items found</strong>
                        Try changing your search or filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="work-table-wrap">
            <table className="work-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>WORK ITEM</th>
                  <th>DEPARTMENT</th>
                  <th>PROGRESS</th>
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>UPDATE STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredWork.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="work-employee">
                        {item.employee}
                      </div>
                      <small className="work-subtitle">
                        {item.employeeId}
                      </small>
                    </td>

                    <td>
                      <div className="work-title">{item.title}</div>
                      <div className="work-subtitle">
                        {item.priority} Priority
                      </div>
                    </td>

                    <td>{item.department}</td>

                    <td>
                      <div className="work-progress">
                        <div className="work-progress-top">
                          <span>Completion</span>
                          <strong>{item.progress}%</strong>
                        </div>

                        <div className="work-progress-track">
                          <div
                            className="work-progress-fill"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>

                        <input
                          className="work-progress-input"
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={item.progress}
                          aria-label={`Update progress for ${item.title}`}
                          onChange={(event) =>
                            updateProgress(item.id, event.target.value)
                          }
                        />
                      </div>
                    </td>

                    <td>{formatDate(item.dueDate)}</td>

                    <td>
                      <span
                        className={`work-status ${getStatusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="work-filter work-status-select"
                        value={item.status}
                        onChange={(event) =>
                          updateStatus(item.id, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}

                {filteredWork.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      <div className="work-empty">
                        <Users size={30} />
                        <strong>No employee work found</strong>
                        Try changing your search or filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div
          className="work-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-modal-title"
          >
            <div className="work-modal-header">
              <h2 id="work-modal-title">
                {editingId ? "Edit Work Allocation" : "Assign New Work"}
              </h2>

              <button
                type="button"
                className="work-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <form className="work-form" onSubmit={handleSubmit}>
              <div className="work-form-grid">
                <div className="work-form-field full">
                  <label htmlFor="work-title">Work Title *</label>
                  <input
                    id="work-title"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Enter work or project title"
                    required
                  />
                </div>

                <div className="work-form-field full">
                  <label htmlFor="work-description">Description</label>
                  <textarea
                    id="work-description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the assigned responsibilities"
                  />
                </div>

                <div className="work-form-field full">
                  <label htmlFor="work-employee">
                    Assign Employee *
                  </label>
                  <select
                    id="work-employee"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id}) — {employee.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-priority">Priority *</label>
                  <select
                    id="work-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-status">Status</label>
                  <select
                    id="work-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-start-date">Start Date *</label>
                  <input
                    id="work-start-date"
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-due-date">Due Date *</label>
                  <input
                    id="work-due-date"
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    min={form.startDate || undefined}
                    required
                  />
                </div>

                {editingId !== null && (
                  <div className="work-form-field full">
                    <label htmlFor="work-progress">
                      Progress: {form.progress}%
                    </label>
                    <input
                      id="work-progress"
                      type="range"
                      name="progress"
                      min="0"
                      max="100"
                      step="5"
                      value={form.progress}
                      onChange={handleFormChange}
                    />
                  </div>
                )}
              </div>

              <div className="work-modal-footer">
                <button
                  type="button"
                  className="work-secondary-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="work-primary-btn">
                  {editingId ? "Save Changes" : "Assign Work"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
