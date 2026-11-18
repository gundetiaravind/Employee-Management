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
  Send,
  Clock,
  Ban,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import invitationService from "../../services/invitationService";
import "./ManageAdmins.css";

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

const emptyInviteForm = {
  employeeName: "",
  email: "",
  phone: "",
  department: "",
};

const emptyEditForm = {
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

function getInvitationStatus(invitation) {
  return String(
    invitation?.invitationStatus ?? invitation?.status ?? "UNKNOWN",
  ).toUpperCase();
}

function getInvitationId(invitation) {
  return invitation?.id ?? invitation?.invitationId;
}

function getInvitationName(invitation) {
  return invitation?.employeeName ?? invitation?.name ?? "Admin Invite";
}

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [error, setError] = useState("");
  const [invitationError, setInvitationError] = useState("");

  const getCompanyIdOrThrow = () => {
    const companyId = getCompanyId();

    if (companyId === null || companyId === undefined || companyId === "") {
      throw new Error(
        "Company ID is missing. Please sign out and log in again.",
      );
    }

    return companyId;
  };

  // Fetch existing administrator accounts
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const companyId = getCompanyIdOrThrow();

      const response = await axiosInstance.get("/api/company-owner/admins", {
        params: { companyId },
      });

      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch admins error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load administrators.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch invitations from the invitation API
  const fetchInvitations = useCallback(async () => {
    try {
      setInvitationLoading(true);
      setInvitationError("");

      const data = await invitationService.getInvitations();

      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch invitations error:", err);

      setInvitationError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load invitations.",
      );
    } finally {
      setInvitationLoading(false);
    }
  }, []);

  const refreshAll = () => {
    fetchAdmins();
    fetchInvitations();
  };

  useEffect(() => {
    fetchAdmins();
    fetchInvitations();
  }, [fetchAdmins, fetchInvitations]);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        (admin.name || "").toLowerCase().includes(query) ||
        (admin.email || "").toLowerCase().includes(query) ||
        (admin.phone || "").toLowerCase().includes(query) ||
        (admin.department || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        (admin.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [admins, search, statusFilter]);

  const adminInvitations = useMemo(() => {
    return invitations.filter(
      (invitation) =>
        String(invitation.invitedRole || "")
          .replace(/^ROLE_/, "")
          .toUpperCase() === "ADMIN",
    );
  }, [invitations]);

  const activeCount = admins.filter(
    (admin) => (admin.status || "").toLowerCase() === "active",
  ).length;

  const inactiveCount = admins.filter(
    (admin) => (admin.status || "").toLowerCase() === "inactive",
  ).length;

  const pendingCount = adminInvitations.filter(
    (invitation) => getInvitationStatus(invitation) === "PENDING",
  ).length;

  const closeModal = () => {
    setModal(null);
    setSelectedAdmin(null);
    setInviteForm(emptyInviteForm);
    setEditForm(emptyEditForm);
    setFormError("");
  };

  const openInvite = () => {
    setSelectedAdmin(null);
    setInviteForm(emptyInviteForm);
    setFormError("");
    setModal("invite");
  };

  const openView = (admin) => {
    setSelectedAdmin(admin);
    setModal("view");
  };

  const openEdit = (admin) => {
    setSelectedAdmin(admin);

    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      department: admin.department || "",
      status: admin.status || "Active",
    });

    setFormError("");
    setModal("edit");
  };

  const updateInviteField = (event) => {
    const { name, value } = event.target;

    setInviteForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  const updateEditField = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  // Send Admin invitation
  const sendAdminInvitation = async (event) => {
    event.preventDefault();
    setFormError("");

    const employeeName = inviteForm.employeeName.trim();
    const email = inviteForm.email.trim().toLowerCase();
    const phone = inviteForm.phone.trim();
    const department = inviteForm.department.trim();

    if (!employeeName || !email) {
      setFormError("Please enter the Admin name and email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      await invitationService.sendInvitation({
        invitedRole: "ADMIN",
        employeeName,
        email,
        phone: phone || null,
        department: department || null,
      });

      window.alert(`Admin invitation sent successfully to ${email}.`);

      closeModal();
      await fetchInvitations();
    } catch (err) {
      console.error("Send Admin invitation error:", err);

      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to send Admin invitation.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Update an existing Admin
  const updateAdmin = async (event) => {
    event.preventDefault();
    setFormError("");

    let companyId;

    try {
      companyId = getCompanyIdOrThrow();
    } catch (err) {
      setFormError(err.message);
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim(),
      department: editForm.department.trim(),
      status: editForm.status,
    };

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

      if (!selectedAdmin?.id) {
        setFormError("Invalid administrator ID.");
        return;
      }

      const response = await axiosInstance.put(
        `/api/company/admins/${selectedAdmin.id}`,
        payload,
        { params: { companyId } },
      );

      const updatedAdmin = response.data;

      setAdmins((current) =>
        current.map((admin) =>
          admin.id === selectedAdmin.id ? updatedAdmin : admin,
        ),
      );

      window.alert("Admin updated successfully!");
      closeModal();
    } catch (err) {
      console.error("Update Admin error:", err);

      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to update administrator.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete an existing Admin
  const deleteAdmin = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`,
    );

    if (!confirmed) return;

    let companyId;

    try {
      companyId = getCompanyIdOrThrow();
    } catch (err) {
      window.alert(err.message);
      return;
    }

    try {
      setDeletingId(admin.id);

      const response = await axiosInstance.delete(
        `/api/company/admins/${admin.id}`,
        { params: { companyId } },
      );

      setAdmins((current) => current.filter((item) => item.id !== admin.id));

      if (selectedAdmin?.id === admin.id) {
        closeModal();
      }

      window.alert(response.data?.message || "Admin removed successfully.");
    } catch (err) {
      console.error("Delete Admin error:", err);

      window.alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to delete administrator.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Revoke a pending Admin invitation
  const revokeInvitation = async (invitation) => {
    const invitationId = getInvitationId(invitation);

    if (!invitationId) {
      window.alert("Invitation ID is missing. Cannot revoke this invitation.");
      return;
    }

    const confirmed = window.confirm(
      `Revoke the invitation sent to ${invitation.email}?`,
    );

    if (!confirmed) return;

    try {
      setRevokingId(invitationId);

      await invitationService.revokeInvitation(invitationId);

      await fetchInvitations();

      window.alert("Invitation revoked successfully.");
    } catch (err) {
      console.error("Revoke invitation error:", err);

      window.alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to revoke invitation.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const invitationStatusClass = (status) => {
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
        return "invitation-status-unknown";
    }
  };

  return (
    <div className="manage-admins-page">
      <div className="admins-heading">
        <div>
          <span className="admins-eyebrow">ORGANIZATION MANAGEMENT</span>

          <h1>Manage Admins</h1>

          <p>Invite administrators and manage your organization accounts.</p>
        </div>

        <div className="admins-heading-actions">
          <button
            type="button"
            className="admins-secondary-btn"
            onClick={refreshAll}
            disabled={loading || invitationLoading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="admins-primary-btn"
            onClick={openInvite}
          >
            <Plus size={18} />
            Invite Admin
          </button>
        </div>
      </div>

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
          <div className="admins-summary-icon pending-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending Invitations</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </div>

      {/* Existing administrator accounts */}
      <div className="admins-table-card">
        <div className="admins-toolbar">
          <div>
            <h2>Administrator List</h2>
            <p>Manage active administrator accounts.</p>
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

              {!loading &&
                !error &&
                filteredAdmins.map((admin) => {
                  const isActive =
                    (admin.status || "").toLowerCase() === "active";

                  return (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-person">
                          <div className="admin-avatar">
                            {(admin.name || "A").charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{admin.name || "—"}</strong>
                            <span>{admin.email || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{admin.department || "—"}</td>
                      <td>{admin.phone || "—"}</td>

                      <td>{formatDate(admin.joined || admin.createdAt)}</td>

                      <td>
                        <span
                          className={`admin-status ${
                            isActive ? "status-active" : "status-inactive"
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

              {!loading && !error && filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="admins-empty">
                      <UserRound size={30} />
                      <strong>No admins found</strong>
                      <span>
                        Try another search or invite a new administrator.
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

      {/* Admin invitations */}
      <div className="admins-table-card invitation-table-card">
        <div className="admins-toolbar">
          <div>
            <h2>Admin Invitations</h2>
            <p>Track invitations sent to administrators.</p>
          </div>

          <button
            type="button"
            className="admins-secondary-btn"
            onClick={fetchInvitations}
            disabled={invitationLoading}
          >
            <RefreshCw size={16} />
            Refresh Invitations
          </button>
        </div>

        {invitationError && (
          <div className="invitation-error">
            {invitationError}
            <button type="button" onClick={fetchInvitations}>
              Retry
            </button>
          </div>
        )}

        <div className="admins-table-wrapper">
          <table className="admins-table invitations-table">
            <thead>
              <tr>
                <th>INVITEE</th>
                <th>EMAIL</th>
                <th>DEPARTMENT</th>
                <th>SENT DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {invitationLoading && (
                <tr>
                  <td colSpan="6">
                    <div className="admins-empty">
                      <RefreshCw size={24} />
                      <strong>Loading invitations...</strong>
                    </div>
                  </td>
                </tr>
              )}

              {!invitationLoading &&
                !invitationError &&
                adminInvitations.map((invitation, index) => {
                  const status = getInvitationStatus(invitation);
                  const invitationId = getInvitationId(invitation);
                  const canRevoke = status === "PENDING";

                  return (
                    <tr key={invitationId ?? `${invitation.email}-${index}`}>
                      <td>
                        <div className="admin-person">
                          <div className="admin-avatar">
                            {getInvitationName(invitation)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{getInvitationName(invitation)}</strong>
                            <span>Administrator</span>
                          </div>
                        </div>
                      </td>

                      <td>{invitation.email || "—"}</td>
                      <td>{invitation.department || "—"}</td>
                      <td>
                        {formatDate(invitation.createdAt || invitation.sentAt)}
                      </td>

                      <td>
                        <span
                          className={`invitation-status ${invitationStatusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        {canRevoke ? (
                          <button
                            type="button"
                            className="invitation-revoke-btn"
                            disabled={
                              !invitationId || revokingId === invitationId
                            }
                            onClick={() => revokeInvitation(invitation)}
                          >
                            <Ban size={15} />
                            {revokingId === invitationId
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        ) : (
                          <span className="invitation-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!invitationLoading &&
                !invitationError &&
                adminInvitations.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="admins-empty">
                        <Mail size={28} />
                        <strong>No Admin invitations yet</strong>
                        <span>
                          Use Invite Admin to send your first invitation.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="admins-table-footer">
          Showing {adminInvitations.length} Admin invitations
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <h2>
                  {modal === "invite"
                    ? "Invite Administrator"
                    : modal === "edit"
                      ? "Edit Admin"
                      : "Admin Details"}
                </h2>

                <p>
                  {modal === "invite"
                    ? "Send an invitation email to a new administrator."
                    : modal === "view"
                      ? "Administrator information."
                      : "Update administrator details."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            {/* Invite Admin form */}
            {modal === "invite" && (
              <form className="admin-form" onSubmit={sendAdminInvitation}>
                <div className="invitation-info">
                  <ShieldCheck size={19} />
                  <span>
                    The invitee will receive an email with a secure link to
                    create their Admin account and password.
                  </span>
                </div>

                <label>
                  Admin Full Name *
                  <input
                    name="employeeName"
                    value={inviteForm.employeeName}
                    onChange={updateInviteField}
                    placeholder="Enter full name"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Email Address *
                  <input
                    type="email"
                    name="email"
                    value={inviteForm.email}
                    onChange={updateInviteField}
                    placeholder="admin@company.com"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    name="phone"
                    value={inviteForm.phone}
                    onChange={updateInviteField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>

                <label>
                  Department
                  <input
                    name="department"
                    value={inviteForm.department}
                    onChange={updateInviteField}
                    placeholder="Enter department"
                    maxLength={100}
                  />
                </label>

                {formError && <p className="admin-form-error">{formError}</p>}

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
                    <Send size={16} />
                    {saving ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}

            {/* View Admin */}
            {modal === "view" && selectedAdmin && (
              <div className="admin-details">
                <div className="admin-details-avatar">
                  {(selectedAdmin.name || "A").charAt(0).toUpperCase()}
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
                        selectedAdmin.joined || selectedAdmin.createdAt,
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

            {/* Edit existing Admin */}
            {modal === "edit" && (
              <form className="admin-form" onSubmit={updateAdmin}>
                <label>
                  Full Name *
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={updateEditField}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Company Email *
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={updateEditField}
                    placeholder="admin@company.com"
                    required
                  />
                </label>

                <label>
                  Mobile Number *
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={updateEditField}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    required
                  />
                </label>

                <label>
                  Department
                  <input
                    name="department"
                    value={editForm.department}
                    onChange={updateEditField}
                    placeholder="Enter department"
                  />
                </label>

                <label>
                  Account Status
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={updateEditField}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                {formError && <p className="admin-form-error">{formError}</p>}

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

export default ManageAdmins;
