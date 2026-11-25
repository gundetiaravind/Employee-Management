
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  RefreshCw,
  X,
  FolderKanban,
} from "lucide-react";

import projectService from "../../services/projectService";
import "./ProjectManagement.css";

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const emptyForm = {
  projectCode: "",
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "PLANNED",
};

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .replace(/_/g, " ")
    .toUpperCase();

const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  const classes = {
    ACTIVE: "active",
    PLANNED: "planned",
    "ON HOLD": "on-hold",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };

  return classes[normalized] || "default";
};

const StatusBadge = ({ status }) => {
  if (!status) return <span>—</span>;

  return (
    <span className={`project-status-badge ${getStatusClass(status)}`}>
      {normalizeStatus(status).replace(/_/g, " ")}
    </span>
  );
};

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await projectService.getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load projects."
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

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedProject(null);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    const existingStatus = normalizeStatus(project.status);

    const matchingStatus = STATUS_OPTIONS.find(
      (option) => option.value === existingStatus
    );

    setForm({
      projectCode: project.projectCode || "",
      projectName: project.projectName || "",
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      status: matchingStatus
        ? matchingStatus.value
        : project.status || "PLANNED",
    });

    setEditingId(project.id);
    setSelectedProject(null);
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (form.endDate < form.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const projectData = {
      projectCode: form.projectCode.trim(),
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await projectService.updateProject(editingId, projectData);
        setMessage("Project updated successfully.");
      } else {
        await projectService.createProject(projectData);
        setMessage("Project created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await loadProjects();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save project. Please check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewProject = async (id) => {
    setError("");
    setMessage("");
    setSelectedProject(null);

    try {
      const data = await projectService.getProjectById(id);
      setSelectedProject(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load project details."
      );
    }
  };

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();

    return (
      String(project.projectCode || "").toLowerCase().includes(search) ||
      String(project.projectName || "").toLowerCase().includes(search) ||
      String(project.status || "").toLowerCase().includes(search)
    );
  });

  return (
    <section className="project-page">
      <div className="project-header">
        <div>
          <h1>Project Management</h1>
          <p>Create, view and update company projects.</p>
        </div>

        <button
          className="project-primary-btn"
          onClick={openCreateForm}
        >
          <Plus size={16} /> Create Project
        </button>
      </div>

      {message && (
        <div className="project-message">{message}</div>
      )}

      {error && (
        <div className="project-error">{error}</div>
      )}

      {showForm && (
        <div className="project-card">
          <div className="project-card-header">
            <h2>
              {editingId !== null ? "Edit Project" : "Create Project"}
            </h2>

            <button
              type="button"
              className="project-icon-btn"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="project-form-grid">
              <label className="project-field">
                Project Code *
                <input
                  name="projectCode"
                  value={form.projectCode}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  disabled={editingId !== null}
                />
              </label>

              <label className="project-field">
                Project Name *
                <input
                  name="projectName"
                  value={form.projectName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </label>

              <label className="project-field">
                Start Date *
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="project-field">
                End Date *
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || undefined}
                  required
                />
              </label>

              <label className="project-field">
                Status *
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="project-field project-description">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
              />
            </label>

            <div className="project-form-actions">
              <button
                type="submit"
                className="project-primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Project"
                    : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProject && (
        <div className="project-card">
          <div className="project-card-header">
            <h2>Project Details</h2>

            <button
              className="project-icon-btn"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="project-details-grid">
            <p><strong>Project ID:</strong> {selectedProject.id}</p>
            <p><strong>Project Code:</strong> {selectedProject.projectCode}</p>
            <p><strong>Project Name:</strong> {selectedProject.projectName}</p>
            <p><strong>Description:</strong> {selectedProject.description || "—"}</p>
            <p><strong>Start Date:</strong> {selectedProject.startDate}</p>
            <p><strong>End Date:</strong> {selectedProject.endDate}</p>
            <p className="project-detail-status">
              <strong>Status:</strong>
              <StatusBadge status={selectedProject.status} />
            </p>
          </div>

          <button
            className="project-primary-btn"
            onClick={() => openEditForm(selectedProject)}
          >
            <Pencil size={16} /> Edit Project
          </button>
        </div>
      )}

      <div className="project-toolbar">
        <div className="project-search">
          <Search size={18} />
          <input
            placeholder="Search by project code, name or status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="project-secondary-btn"
          onClick={loadProjects}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="project-table-wrapper">
        <table className="project-table">
          <thead>
            <tr>
              {[
                "Project Code",
                "Project Name",
                "Start Date",
                "End Date",
                "Status",
                "Actions",
              ].map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="project-empty-cell">
                  Loading projects...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="project-empty-cell">
                  <FolderKanban size={24} />
                  <p>No projects found.</p>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.projectCode}</td>
                  <td>{project.projectName}</td>
                  <td>{project.startDate}</td>
                  <td>{project.endDate}</td>
                  <td>
                    <StatusBadge status={project.status} />
                  </td>
                  <td>
                    <div className="project-actions">
                      <button
                        className="project-icon-btn"
                        onClick={() => handleViewProject(project.id)}
                        title="View project"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="project-icon-btn"
                        onClick={() => openEditForm(project)}
                        title="Edit project"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
