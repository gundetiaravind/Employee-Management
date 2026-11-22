
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  BriefcaseBusiness,
  Users,
  Clock,
  CheckCircle,
  Pencil,
  X,
  RefreshCw,
} from "lucide-react";

import employeeProjectService from "../../services/employeeProjectService";
import projectService from "../../services/projectService";
import "./WorkAllocation.css";

const emptyForm = {
  employeeId: "",
  projectCode: "",
  projectStartDate: "",
  projectEndDate: "",
  reportingManagerEmployeeCode: "",
  reportingManagerEmail: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorkAllocation() {
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [assignmentData, projectData] = await Promise.all([
        employeeProjectService.getAllAssignments(),
        projectService.getAllProjects(),
      ]);

      setAssignments(assignmentData || []);
      setProjects(projectData || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load project assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    const searchText = search.toLowerCase();

    return assignments.filter((item) => {
      const matchesSearch =
        String(item.employeeId || "").toLowerCase().includes(searchText) ||
        (item.projectCode || "").toLowerCase().includes(searchText) ||
        (item.projectName || "").toLowerCase().includes(searchText) ||
        (item.reportingManagerEmployeeCode || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        item.assignmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  const stats = useMemo(() => ({
    total: assignments.length,
    active: assignments.filter(
      (item) => item.assignmentStatus !== "CLOSED"
    ).length,
    closed: assignments.filter(
      (item) => item.assignmentStatus === "CLOSED"
    ).length,
    projects: projects.length,
  }), [assignments, projects]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (assignment) => {
    if (assignment.assignmentStatus === "CLOSED") {
      setError("Closed assignments cannot be edited.");
      return;
    }

    setEditingId(assignment.id);
    setForm({
      employeeId: String(assignment.employeeId),
      projectCode: assignment.projectCode || "",
      projectStartDate: assignment.projectStartDate || "",
      projectEndDate: assignment.projectEndDate || "",
      reportingManagerEmployeeCode:
        assignment.reportingManagerEmployeeCode || "",
      reportingManagerEmail: assignment.reportingManagerEmail || "",
    });

    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
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
    setMessage("");

    if (form.projectEndDate < form.projectStartDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const requestData = {
      employeeId: Number(form.employeeId),
      projectCode: form.projectCode,
      projectStartDate: form.projectStartDate,
      projectEndDate: form.projectEndDate,
      reportingManagerEmployeeCode:
        form.reportingManagerEmployeeCode.trim(),
      reportingManagerEmail: form.reportingManagerEmail.trim(),
    };

    setSubmitting(true);

    try {
      if (editingId !== null) {
        await employeeProjectService.updateAssignment(
          editingId,
          requestData
        );
        setMessage("Project assignment updated successfully.");
      } else {
        await employeeProjectService.assignEmployee(requestData);
        setMessage("Employee assigned to project successfully.");
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the project assignment. Check the entered details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to close this project assignment?"
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await employeeProjectService.closeAssignment(id);
      setMessage("Project assignment closed successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to close the project assignment."
      );
    }
  };

  return (
    <div className="work-page">
      <div className="work-header">
        <div className="work-heading">
          <h1>Work Allocation</h1>
          <p>Assign employees to projects and manage their assignments.</p>
        </div>

        <div className="work-actions">
          <button
            type="button"
            className="work-secondary-btn"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="work-primary-btn"
            onClick={openAddModal}
          >
            <Plus size={17} />
            Assign Employee
          </button>
        </div>
      </div>

      {message && <div className="work-message work-success">{message}</div>}
      {error && <div className="work-message work-error">{error}</div>}

      <div className="work-stats">
        <div className="work-stat">
          <div className="work-stat-icon purple">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <strong>{stats.total}</strong>
            <span>Total Assignments</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <strong>{stats.active}</strong>
            <span>Active Assignments</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon orange">
            <Clock size={21} />
          </div>
          <div>
            <strong>{stats.closed}</strong>
            <span>Closed Assignments</span>
          </div>
        </div>

        <div className="work-stat">
          <div className="work-stat-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <strong>{stats.projects}</strong>
            <span>Total Projects</span>
          </div>
        </div>
      </div>

      <section className="work-panel">
        <div className="work-toolbar">
          <div className="work-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search employee, project or manager..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="work-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="work-empty">Loading project assignments...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="work-empty">
            <BriefcaseBusiness size={30} />
            <strong>No project assignments found</strong>
            Try changing your search or filters.
          </div>
        ) : (
          <div className="work-table-wrap">
            <table className="work-table">
              <thead>
                <tr>
                  <th>ASSIGNMENT</th>
                  <th>EMPLOYEE ID</th>
                  <th>PROJECT</th>
                  <th>START DATE</th>
                  <th>END DATE</th>
                  <th>REPORTING MANAGER</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.employeeId}</td>
                    <td>
                      <div className="work-title">{item.projectCode}</div>
                      <div className="work-subtitle">{item.projectName}</div>
                    </td>
                    <td>{formatDate(item.projectStartDate)}</td>
                    <td>{formatDate(item.projectEndDate)}</td>
                    <td>
                      <div className="work-employee">
                        {item.reportingManagerEmployeeCode}
                      </div>
                      <small className="work-subtitle">
                        {item.reportingManagerEmail}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`work-status ${
                          item.assignmentStatus === "CLOSED"
                            ? "closed"
                            : "in-progress"
                        }`}
                      >
                        {item.assignmentStatus || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div className="work-actions">
                        <button
                          type="button"
                          className="work-icon-btn"
                          title="Edit assignment"
                          onClick={() => openEditModal(item)}
                          disabled={item.assignmentStatus === "CLOSED"}
                        >
                          <Pencil size={15} />
                        </button>

                        {item.assignmentStatus !== "CLOSED" && (
                          <button
                            type="button"
                            className="work-icon-btn"
                            title="Close assignment"
                            onClick={() => handleClose(item.id)}
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="work-modal-overlay">
          <div
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-modal-title"
          >
            <div className="work-modal-header">
              <h2 id="work-modal-title">
                {editingId ? "Edit Project Assignment" : "Assign Employee"}
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
                <div className="work-form-field">
                  <label htmlFor="work-employee">Employee Database ID *</label>
                  <input
                    id="work-employee"
                    type="number"
                    name="employeeId"
                    min="1"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                    placeholder="Enter employee ID"
                  />
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-project">Project *</label>
                  <select
                    id="work-project"
                    name="projectCode"
                    value={form.projectCode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.projectCode}>
                        {project.projectCode} - {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-start-date">Start Date *</label>
                  <input
                    id="work-start-date"
                    type="date"
                    name="projectStartDate"
                    value={form.projectStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-end-date">End Date *</label>
                  <input
                    id="work-end-date"
                    type="date"
                    name="projectEndDate"
                    value={form.projectEndDate}
                    onChange={handleChange}
                    min={form.projectStartDate || undefined}
                    required
                  />
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-manager-code">
                    Reporting Manager Employee Code *
                  </label>
                  <input
                    id="work-manager-code"
                    name="reportingManagerEmployeeCode"
                    value={form.reportingManagerEmployeeCode}
                    onChange={handleChange}
                    required
                    placeholder="Enter manager employee code"
                  />
                </div>

                <div className="work-form-field">
                  <label htmlFor="work-manager-email">
                    Reporting Manager Email *
                  </label>
                  <input
                    id="work-manager-email"
                    type="email"
                    name="reportingManagerEmail"
                    value={form.reportingManagerEmail}
                    onChange={handleChange}
                    required
                    placeholder="Enter manager email"
                  />
                </div>
              </div>

              <div className="work-modal-footer">
                <button
                  type="button"
                  className="work-secondary-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="work-primary-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Assignment"
                      : "Assign Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
