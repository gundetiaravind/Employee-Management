
import { useEffect, useState } from "react";
import {
  UserPlus,
  RefreshCw,
  Pencil,
  X,
  CheckCircle,
  Search,
} from "lucide-react";

import employeeProjectService from "../../services/employeeProjectService";
import projectService from "../../services/projectService";
import "./EmployeeProjectManagement.css";

const initialForm = {
  employeeId: "",
  projectCode: "",
  projectStartDate: "",
  projectEndDate: "",
  reportingManagerEmployeeCode: "",
  reportingManagerEmail: "",
};

export default function EmployeeProjectManagement() {
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
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
          "Unable to load assignments or projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (form.projectEndDate < form.projectStartDate) {
      setError("Project end date cannot be before the start date.");
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
      if (editingId) {
        await employeeProjectService.updateAssignment(
          editingId,
          requestData
        );
        setMessage("Assignment updated successfully.");
      } else {
        await employeeProjectService.assignEmployee(requestData);
        setMessage("Employee assigned to project successfully.");
      }

      resetForm();
      await loadPageData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the assignment. Check the entered details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);

    setForm({
      employeeId: String(assignment.employeeId),
      projectCode: assignment.projectCode || "",
      projectStartDate: assignment.projectStartDate || "",
      projectEndDate: assignment.projectEndDate || "",
      reportingManagerEmployeeCode:
        assignment.reportingManagerEmployeeCode || "",
      reportingManagerEmail:
        assignment.reportingManagerEmail || "",
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClose = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this project assignment?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await employeeProjectService.closeAssignment(id);
      setMessage("Assignment closed successfully.");
      await loadPageData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to close the assignment."
      );
    }
  };

  const handleSearch = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      let data;

      if (employeeFilter.trim()) {
        data =
          await employeeProjectService.getAssignmentsByEmployee(
            employeeFilter.trim()
          );
      } else if (projectFilter.trim()) {
        data =
          await employeeProjectService.getAssignmentsByProject(
            projectFilter.trim()
          );
      } else {
        data = await employeeProjectService.getAllAssignments();
      }

      setAssignments(data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to find matching assignments."
      );
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setEmployeeFilter("");
    setProjectFilter("");
    loadPageData();
  };

  return (
    <div className="employee-project-page">
      <div className="employee-project-header">
        <div>
          <h1>Employee Project Assignments</h1>
          <p>
            Assign employees to projects and manage their assignments.
          </p>
        </div>

        <button
          type="button"
          className="ep-secondary-btn"
          onClick={loadPageData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="ep-message ep-success">{message}</div>
      )}

      {error && (
        <div className="ep-message ep-error">{error}</div>
      )}

      <section className="ep-card">
        <div className="ep-card-header">
          <h2>
            <UserPlus size={19} />
            {editingId
              ? "Update Assignment"
              : "Assign Employee to Project"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ep-form-grid">
            <div className="ep-field">
              <label>Employee Database ID *</label>
              <input
                type="number"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                min="1"
                required
                placeholder="Enter employee ID"
              />
            </div>

            <div className="ep-field">
              <label>Project *</label>
              <select
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

            <div className="ep-field">
              <label>Assignment Start Date *</label>
              <input
                type="date"
                name="projectStartDate"
                value={form.projectStartDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ep-field">
              <label>Assignment End Date *</label>
              <input
                type="date"
                name="projectEndDate"
                value={form.projectEndDate}
                onChange={handleChange}
                min={form.projectStartDate || undefined}
                required
              />
            </div>

            <div className="ep-field">
              <label>Reporting Manager Employee Code *</label>
              <input
                type="text"
                name="reportingManagerEmployeeCode"
                value={form.reportingManagerEmployeeCode}
                onChange={handleChange}
                required
                placeholder="Enter manager employee code"
              />
            </div>

            <div className="ep-field">
              <label>Reporting Manager Email *</label>
              <input
                type="email"
                name="reportingManagerEmail"
                value={form.reportingManagerEmail}
                onChange={handleChange}
                required
                placeholder="Enter manager email"
              />
            </div>
          </div>

          <div className="ep-form-actions">
            <button
              type="submit"
              className="ep-primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Update Assignment"
                  : "Assign Employee"}
            </button>

            {editingId && (
              <button
                type="button"
                className="ep-cancel-btn"
                onClick={resetForm}
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="ep-card">
        <div className="ep-card-header">
          <h2>Assignment Records</h2>
        </div>

        <div className="ep-filter-grid">
          <div className="ep-field">
            <label>Filter by Employee ID</label>
            <input
              type="number"
              min="1"
              value={employeeFilter}
              onChange={(e) => {
                setEmployeeFilter(e.target.value);
                setProjectFilter("");
              }}
              placeholder="Enter employee ID"
            />
          </div>

          <div className="ep-field">
            <label>Filter by Project ID</label>
            <input
              type="number"
              min="1"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setEmployeeFilter("");
              }}
              placeholder="Enter project ID"
            />
          </div>

          <div className="ep-filter-actions">
            <button
              type="button"
              className="ep-primary-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search size={16} />
              Search
            </button>

            <button
              type="button"
              className="ep-cancel-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <p className="ep-empty">Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="ep-empty">No assignment records found.</p>
        ) : (
          <div className="ep-table-wrapper">
            <table className="ep-table">
              <thead>
                <tr>
                  <th>Assignment ID</th>
                  <th>Employee ID</th>
                  <th>Project</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>#{assignment.id}</td>
                    <td>{assignment.employeeId}</td>
                    <td>
                      <strong>{assignment.projectCode}</strong>
                      <div>{assignment.projectName}</div>
                    </td>
                    <td>{assignment.projectStartDate}</td>
                    <td>{assignment.projectEndDate}</td>
                    <td>
                      {assignment.reportingManagerEmployeeCode}
                      <div>{assignment.reportingManagerEmail}</div>
                    </td>
                    <td>
                      <span
                        className={`ep-status ${
                          assignment.assignmentStatus === "CLOSED"
                            ? "ep-status-closed"
                            : "ep-status-active"
                        }`}
                      >
                        {assignment.assignmentStatus || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="ep-action-group">
                        <button
                          type="button"
                          title="Edit assignment"
                          className="ep-icon-btn"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Pencil size={16} />
                        </button>

                        {assignment.assignmentStatus !== "CLOSED" && (
                          <button
                            type="button"
                            title="Close assignment"
                            className="ep-close-btn"
                            onClick={() => handleClose(assignment.id)}
                          >
                            <CheckCircle size={16} />
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
    </div>
  );
}
