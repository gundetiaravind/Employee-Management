
import { useMemo, useState } from "react";
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
} from "lucide-react";
import "./ManageAdmins.css";

const initialAdmins = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@orgconnect.com",
    phone: "9876543210",
    department: "Human Resources",
    joined: "2026-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Reddy",
    email: "priya@orgconnect.com",
    phone: "9876543211",
    department: "Operations",
    joined: "2026-02-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Kiran Kumar",
    email: "kiran@orgconnect.com",
    phone: "9876543212",
    department: "Finance",
    joined: "2026-03-05",
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  joined: "",
  status: "Active",
};

function ManageAdmins() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const query = search.toLowerCase();

      const matchesSearch =
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.department.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || admin.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [admins, search, statusFilter]);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError("");
    setSelectedAdmin(null);
    setModal("add");
  };

  const openEdit = (admin) => {
    setSelectedAdmin(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      department: admin.department,
      joined: admin.joined,
      status: admin.status,
    });
    setFormError("");
    setModal("edit");
  };

  const openView = (admin) => {
    setSelectedAdmin(admin);
    setModal("view");
  };

  const saveAdmin = (event) => {
    event.preventDefault();
    setFormError("");

    const emailExists = admins.some(
      (admin) =>
        admin.email.toLowerCase() === form.email.trim().toLowerCase() &&
        admin.id !== selectedAdmin?.id
    );

    if (emailExists) {
      setFormError("An admin with this email already exists.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (modal === "add") {
      const newAdmin = {
        ...form,
        id: Date.now(),
        name: form.name.trim(),
        email: form.email.trim(),
      };
      setAdmins((current) => [newAdmin, ...current]);
    } else {
      setAdmins((current) =>
        current.map((admin) =>
          admin.id === selectedAdmin.id
            ? { ...admin, ...form, name: form.name.trim(), email: form.email.trim() }
            : admin
        )
      );
    }

    setModal(null);
  };

  const deleteAdmin = (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`
    );

    if (confirmed) {
      setAdmins((current) =>
        current.filter((item) => item.id !== admin.id)
      );
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="manage-admins-page">
      <div className="admins-heading">
        <div>
          <span className="admins-eyebrow">ORGANIZATION MANAGEMENT</span>
          <h1>Manage Admins</h1>
          <p>Add, view, update and manage your organization administrators.</p>
        </div>

        <button className="admins-primary-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Admin
        </button>
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
            <strong>
              {admins.filter((admin) => admin.status === "Active").length}
            </strong>
          </div>
        </div>

        <div className="admins-summary-card">
          <div className="admins-summary-icon inactive-icon">
            <UserRound size={21} />
          </div>
          <div>
            <span>Inactive Admins</span>
            <strong>
              {admins.filter((admin) => admin.status === "Inactive").length}
            </strong>
          </div>
        </div>
      </div>

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
              {filteredAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="admin-person">
                      <div className="admin-avatar">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{admin.name}</strong>
                        <span>{admin.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{admin.department}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.joined}</td>
                  <td>
                    <span
                      className={`admin-status ${
                        admin.status === "Active" ? "status-active" : "status-inactive"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button title="View" onClick={() => openView(admin)}>
                        <Eye size={17} />
                      </button>
                      <button title="Edit" onClick={() => openEdit(admin)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Delete"
                        className="delete-action"
                        onClick={() => deleteAdmin(admin)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="admins-empty">
                      <UserRound size={30} />
                      <strong>No admins found</strong>
                      <span>Try another search or add a new admin.</span>
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

      {modal && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
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
                    : "Enter the administrator details below."}
                </p>
              </div>
              <button onClick={() => setModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {modal === "view" ? (
              <div className="admin-details">
                <div className="admin-details-avatar">
                  {selectedAdmin.name.charAt(0).toUpperCase()}
                </div>
                <h3>{selectedAdmin.name}</h3>
                <span className={`admin-status ${
                  selectedAdmin.status === "Active" ? "status-active" : "status-inactive"
                }`}>
                  {selectedAdmin.status}
                </span>

                <div className="admin-detail-row">
                  <Mail size={17} />
                  <div><span>Email</span><strong>{selectedAdmin.email}</strong></div>
                </div>
                <div className="admin-detail-row">
                  <Phone size={17} />
                  <div><span>Phone</span><strong>{selectedAdmin.phone}</strong></div>
                </div>
                <div className="admin-detail-row">
                  <ShieldCheck size={17} />
                  <div><span>Department</span><strong>{selectedAdmin.department}</strong></div>
                </div>
                <div className="admin-detail-row">
                  <CalendarDays size={17} />
                  <div><span>Joined Date</span><strong>{selectedAdmin.joined}</strong></div>
                </div>

                <button
                  className="admins-primary-btn admin-view-edit"
                  onClick={() => openEdit(selectedAdmin)}
                >
                  <Pencil size={16} /> Edit Admin
                </button>
              </div>
            ) : (
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
                  Joined Date *
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

                {formError && <p className="admin-form-error">{formError}</p>}

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-cancel-btn"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admins-primary-btn">
                    {modal === "add" ? "Add Admin" : "Save Changes"}
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
