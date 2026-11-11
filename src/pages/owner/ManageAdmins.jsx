
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  UserRound,
  RefreshCw,
} from "lucide-react";
const AUTH_KEY = "orgconnect-auth";
import axiosInstance from "../../utils/axiosInstance";
import "./ManageAdmins.css";
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
const COMPANY_ID = user?.companyId;
alert(COMPANY_ID);
//return false;
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  status: "Active",
};

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // GET: Fetch Admins
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `/api/company-owner/admins?companyId=${COMPANY_ID}`
      );

      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch admins error:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load administrators."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Search and Filter
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        (admin.name || "").toLowerCase().includes(query) ||
        (admin.email || "").toLowerCase().includes(query) ||
        (admin.phone || "").toLowerCase().includes(query) ||
        (admin.department || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        (admin.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [admins, search, statusFilter]);

  // Summary Counts
  const activeCount = admins.filter(
    (admin) => (admin.status || "").toLowerCase() === "active"
  ).length;

  const inactiveCount = admins.filter(
    (admin) => (admin.status || "").toLowerCase() === "inactive"
  ).length;

  // Close Modal
  const closeModal = () => {
    setModal(null);
    setSelectedAdmin(null);
    setForm(emptyForm);
    setFormError("");
  };

  // Open Add Modal
  const openAdd = () => {
    setSelectedAdmin(null);
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  };

  // Open View Modal
  const openView = (admin) => {
    setSelectedAdmin(admin);
    setModal("view");
  };

  // Open Edit Modal
  const openEdit = (admin) => {
    setSelectedAdmin(admin);

    setForm({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      department: admin.department || "",
      status: admin.status || "Active",
    });

    setFormError("");
    setModal("edit");
  };

  // Update Form Fields
  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // POST / PUT: Add or Update Admin
  const saveAdmin = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
    };

    // Department is supported by PUT, but not included
    // in the provided POST request contract.
    if (modal === "edit") {
      payload.department = form.department.trim();
    }

    if (!payload.name || !payload.email) {
      setFormError("Please enter name and email.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(payload.phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      if (modal === "add") {
        // POST: Add Admin
        const response = await axiosInstance.post(
          `/api/company-owner/admins?companyId=${COMPANY_ID}`,
          payload
        );

        // Use actual backend response
        setAdmins((current) => [
          response.data,
          ...current,
        ]);

        window.alert("Admin added successfully!");
      } else {
        // PUT: Update Admin
        if (!selectedAdmin?.id) {
          setFormError("Invalid administrator ID.");
          return;
        }

        const response = await axiosInstance.put(
          `/api/company/admins/${selectedAdmin.id}?companyId=${COMPANY_ID}`,
          payload
        );

        const updatedAdmin = response.data;

        setAdmins((current) =>
          current.map((admin) =>
            admin.id === selectedAdmin.id
              ? updatedAdmin
              : admin
          )
        );

        window.alert("Admin updated successfully!");
      }

      closeModal();
    } catch (err) {
      console.error("Save admin error:", err);

      setFormError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to save administrator. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Remove Admin
  const deleteAdmin = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(admin.id);

      const response = await axiosInstance.delete(
        `/api/company/admins/${admin.id}?companyId=${COMPANY_ID}`
      );

      setAdmins((current) =>
        current.filter((item) => item.id !== admin.id)
      );

      if (selectedAdmin?.id === admin.id) {
        closeModal();
      }

      window.alert(
        response.data?.message ||
        "Admin removed successfully."
      );
    } catch (err) {
      console.error("Delete admin error:", err);

      window.alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to delete administrator."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="manage-admins-page">

      {/* Page Heading */}
      <div className="admins-heading">
        <div>
          <span className="admins-eyebrow">
            ORGANIZATION MANAGEMENT
          </span>

          <h1>Manage Admins</h1>

          <p>
            Add, view, update and manage your organization administrators.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="admins-primary-btn"
            onClick={fetchAdmins}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="admins-primary-btn"
            onClick={openAdd}
          >
            <Plus size={18} />
            Add Admin
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admins-summary">

        <div className="admins-summary-card">
          <div className="admins-summary-icon">
            <ShieldCheck size={21} />
          </div>
          <div>
            <span>Total Admins</span>
            <strong>{admins.length}</strong>
          </div>
        </div>

        <div className="admins-summary-card">
          <div className="admins-summary-icon active-icon">
            <UserRound size={21} />
          </div>
          <div>
            <span>Active Admins</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="admins-summary-card">
          <div className="admins-summary-icon inactive-icon">
            <UserRound size={21} />
          </div>
          <div>
            <span>Inactive Admins</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

      </div>

      {/* Administrator Table */}
      <div className="admins-table-card">

        <div className="admins-toolbar">
          <div>
            <h2>Administrator List</h2>
            <p>Manage administrator accounts in your organization.</p>
          </div>

          <div className="admins-filters">

            <div className="admins-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search admins..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

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

        <div className="admins-table-wrapper">
          <table className="admins-table">

            <thead>
              <tr>
                <th>ADMIN</th>
                <th>DEPARTMENT</th>
                <th>PHONE</th>
                <th>JOINED DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan="6">
                    <div className="admins-empty">
                      <RefreshCw size={25} />
                      <strong>Loading administrators...</strong>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6">
                    <div className="admins-empty">
                      <strong>{error}</strong>
                      <button
                        type="button"
                        className="admins-primary-btn"
                        onClick={fetchAdmins}
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error &&
                filteredAdmins.map((admin) => {

                  const isActive =
                    (admin.status || "").toLowerCase() === "active";

                  return (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-person">
                          <div className="admin-avatar">
                            {(admin.name || "A")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{admin.name || "—"}</strong>
                            <span>{admin.email || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{admin.department || "—"}</td>

                      <td>{admin.phone || "—"}</td>

                      <td>
                        {formatDate(admin.joined || admin.createdAt)}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            isActive
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {admin.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">

                          <button
                            type="button"
                            title="View"
                            onClick={() => openView(admin)}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() => openEdit(admin)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            className="delete-action"
                            disabled={deletingId === admin.id}
                            onClick={() => deleteAdmin(admin)}
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && !error &&
                filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="admins-empty">
                        <UserRound size={30} />
                        <strong>No admins found</strong>
                        <span>
                          Try another search or add a new admin.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

            </tbody>
          </table>
        </div>

        <div className="admins-table-footer">
          Showing {filteredAdmins.length} of {admins.length} administrators
        </div>

      </div>

      {/* Add / Edit / View Modal */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="admin-modal">

            <div className="admin-modal-header">
              <div>
                <h2>
                  {modal === "add"
                    ? "Add New Admin"
                    : modal === "edit"
                    ? "Edit Admin"
                    : "Admin Details"}
                </h2>

                <p>
                  {modal === "view"
                    ? "Administrator information"
                    : "Enter administrator details below."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* View Details */}
            {modal === "view" && selectedAdmin && (
              <div className="admin-details">

                <div className="admin-details-avatar">
                  {(selectedAdmin.name || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h3>{selectedAdmin.name || "—"}</h3>

                <span
                  className={`admin-status ${
                    (selectedAdmin.status || "").toLowerCase() === "active"
                      ? "status-active"
                      : "status-inactive"
                  }`}
                >
                  {selectedAdmin.status || "Unknown"}
                </span>

                <div className="admin-detail-row">
                  <Mail size={17} />
                  <div>
                    <span>Email</span>
                    <strong>{selectedAdmin.email || "—"}</strong>
                  </div>
                </div>

                <div className="admin-detail-row">
                  <Phone size={17} />
                  <div>
                    <span>Phone</span>
                    <strong>{selectedAdmin.phone || "—"}</strong>
                  </div>
                </div>

                <div className="admin-detail-row">
                  <ShieldCheck size={17} />
                  <div>
                    <span>Department</span>
                    <strong>{selectedAdmin.department || "—"}</strong>
                  </div>
                </div>

                <div className="admin-detail-row">
                  <CalendarDays size={17} />
                  <div>
                    <span>Joined Date</span>
                    <strong>
                      {formatDate(
                        selectedAdmin.joined || selectedAdmin.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="admin-detail-row">
                  <ShieldCheck size={17} />
                  <div>
                    <span>Email Verified</span>
                    <strong>
                      {selectedAdmin.emailVerified ? "Yes" : "No"}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="admins-primary-btn admin-view-edit"
                  onClick={() => openEdit(selectedAdmin)}
                >
                  <Pencil size={16} />
                  Edit Admin
                </button>

              </div>
            )}

            {/* Add / Edit Form */}
            {(modal === "add" || modal === "edit") && (
              <form className="admin-form" onSubmit={saveAdmin}>

                <label>
                  Full Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Enter full name"
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
                    placeholder="admin@company.com"
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

                {modal === "edit" && (
                  <label>
                    Department
                    <input
                      name="department"
                      value={form.department}
                      onChange={updateField}
                      placeholder="Enter department"
                    />
                  </label>
                )}

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
                  <p className="admin-form-error">
                    {formError}
                  </p>
                )}

                <div className="admin-form-actions">

                  <button
                    type="button"
                    className="admin-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admins-primary-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : modal === "add"
                      ? "Add Admin"
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

export default ManageAdmins;
