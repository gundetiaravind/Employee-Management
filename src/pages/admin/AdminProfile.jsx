
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Camera,
} from "lucide-react";

const STORAGE_KEY = "OrgConnect-demo-user";

const initialProfile = {
  name: "Admin User",
  email: "admin@orgconnect.com",
  phone: "",
  department: "Administration",
  designation: "Company Administrator",
  employeeId: "ADM001",
  company: "OrgConnect Demo Company",
};

export default function AdminProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "null"
      );

      if (user) {
        const loaded = {
          ...initialProfile,
          name: user.name || initialProfile.name,
          email: user.email || initialProfile.email,
          phone: user.phone || "",
          department: user.department || initialProfile.department,
          designation: user.designation || initialProfile.designation,
          employeeId: user.employeeId || initialProfile.employeeId,
          company: user.companyName || user.company || initialProfile.company,
        };

        setProfile(loaded);
        setForm(loaded);
      }
    } catch {
      setMessage("Unable to load the saved profile.");
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    const updated = {
      ...profile,
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    if (!updated.name) {
      setMessage("Please enter your name.");
      return;
    }

    setProfile(updated);
    setForm(updated);

    try {
      const existing = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "null"
      );

      if (existing) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            name: updated.name,
            phone: updated.phone,
            department: updated.department,
            designation: updated.designation,
          })
        );
      }

      setMessage("Profile changes saved for this session.");
      setEditing(false);
    } catch {
      setMessage("Profile could not be saved.");
    }
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
    setMessage("");
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const Field = ({ icon: Icon, label, name, value, readOnly = false }) => (
    <div className="admin-profile-field">
      <label htmlFor={`admin-profile-${name}`}>{label}</label>
      <div className="admin-profile-input-wrap">
        <Icon size={17} />
        {editing && !readOnly ? (
          <input
            id={`admin-profile-${name}`}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            type={name === "email" ? "email" : "text"}
          />
        ) : (
          <span>{value || "Not provided"}</span>
        )}
        {readOnly && <small>Read only</small>}
      </div>
    </div>
  );

  return (
    <div className="admin-profile-page">
      <style>{`
        .admin-profile-page {
          color: var(--text, #202536);
          width: 100%;
        }

        .admin-profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .admin-profile-header h1 {
          font-size: 26px;
          margin: 0 0 7px;
        }

        .admin-profile-header p {
          color: var(--muted, #7a8192);
          font-size: 14px;
          margin: 0;
        }

        .admin-profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          border-radius: 9px;
          padding: 11px 17px;
          background: var(--primary, #6558d3);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .admin-profile-btn.cancel {
          background: var(--card, white);
          color: var(--text, #202536);
          border: 1px solid var(--border, #e7e9f0);
        }

        .admin-profile-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .admin-profile-card {
          background: var(--card, white);
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .admin-profile-banner {
          height: 125px;
          background: linear-gradient(115deg, #6558d3, #8b7ce8);
        }

        .admin-profile-identity {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 25px 24px;
          margin-top: -43px;
          flex-wrap: wrap;
        }

        .admin-profile-avatar {
          width: 90px;
          height: 90px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 5px solid var(--card, white);
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
          font-size: 27px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .admin-profile-identity-details {
          padding-top: 44px;
          min-width: 0;
        }

        .admin-profile-identity-details h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .admin-profile-identity-details p {
          color: var(--muted, #7a8192);
          font-size: 13px;
          margin: 0;
        }

        .admin-profile-role {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          padding: 5px 10px;
          border-radius: 20px;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
          font-size: 11px;
          font-weight: 700;
        }

        .admin-profile-section {
          padding: 23px 25px;
          border-top: 1px solid var(--border, #e7e9f0);
        }

        .admin-profile-section h3 {
          font-size: 16px;
          margin: 0 0 5px;
        }

        .admin-profile-section > p {
          font-size: 12px;
          color: var(--muted, #7a8192);
          margin: 0 0 21px;
        }

        .admin-profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .admin-profile-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted, #7a8192);
          margin-bottom: 9px;
        }

        .admin-profile-input-wrap {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 9px;
          color: var(--muted, #7a8192);
          background: var(--bg, #f6f7fb);
        }

        .admin-profile-input-wrap span {
          color: var(--text, #202536);
          font-size: 13px;
          overflow-wrap: anywhere;
          flex: 1;
        }

        .admin-profile-input-wrap input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--text, #202536);
          font-size: 13px;
        }

        .admin-profile-input-wrap small {
          font-size: 10px;
          white-space: nowrap;
        }

        .admin-profile-notice {
          margin: 0 25px 20px;
          padding: 11px 13px;
          border-radius: 8px;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
          font-size: 13px;
        }

        .admin-profile-security {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 15px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 10px;
        }

        .admin-profile-security svg {
          color: var(--primary, #6558d3);
          flex-shrink: 0;
        }

        .admin-profile-security strong {
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .admin-profile-security p {
          color: var(--muted, #7a8192);
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 650px) {
          .admin-profile-header h1 {
            font-size: 22px;
          }

          .admin-profile-grid {
            grid-template-columns: 1fr;
            gap: 17px;
          }

          .admin-profile-section {
            padding: 19px;
          }

          .admin-profile-identity {
            padding-left: 19px;
            padding-right: 19px;
          }

          .admin-profile-notice {
            margin-left: 19px;
            margin-right: 19px;
          }
        }
      `}</style>

      <div className="admin-profile-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your administrator information.</p>
        </div>

        {!editing ? (
          <button
            className="admin-profile-btn"
            onClick={() => {
              setForm(profile);
              setEditing(true);
              setMessage("");
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="admin-profile-actions">
            <button
              className="admin-profile-btn cancel"
              onClick={cancelEdit}
              type="button"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              className="admin-profile-btn"
              onClick={handleSave}
              type="button"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-banner" />

        <div className="admin-profile-identity">
          <div className="admin-profile-avatar">
            {initials || <UserRound size={35} />}
          </div>

          <div className="admin-profile-identity-details">
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <div className="admin-profile-role">
              <ShieldCheck size={14} />
              Company Administrator
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-profile-section">
            <h3>Personal Information</h3>
            <p>Your basic contact and identity details.</p>

            <div className="admin-profile-grid">
              <Field
                icon={UserRound}
                label="Full Name"
                name="name"
                value={profile.name}
              />

              <Field
                icon={Mail}
                label="Email Address"
                name="email"
                value={profile.email}
                readOnly
              />

              <Field
                icon={Phone}
                label="Phone Number"
                name="phone"
                value={profile.phone}
              />

              <Field
                icon={BriefcaseBusiness}
                label="Designation"
                name="designation"
                value={profile.designation}
              />
            </div>
          </div>

          <div className="admin-profile-section">
            <h3>Company Information</h3>
            <p>Organization and administrator identification.</p>

            <div className="admin-profile-grid">
              <Field
                icon={Building2}
                label="Company"
                name="company"
                value={profile.company}
                readOnly
              />

              <Field
                icon={BriefcaseBusiness}
                label="Department"
                name="department"
                value={profile.department}
              />

              <Field
                icon={ShieldCheck}
                label="Employee ID"
                name="employeeId"
                value={profile.employeeId}
                readOnly
              />

              <Field
                icon={ShieldCheck}
                label="Account Role"
                name="role"
                value="ADMIN"
                readOnly
              />
            </div>
          </div>
        </form>

        {message && (
          <div className="admin-profile-notice" role="status">
            {message}
          </div>
        )}
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-section">
          <h3>Account Security</h3>
          <p>Information about your account access.</p>

          <div className="admin-profile-security">
            <ShieldCheck size={22} />
            <div>
              <strong>Administrator account</strong>
              <p>
                Your account role and company access are managed by your
                organization's account settings. Contact your Owner if
                you need changes to your access permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
