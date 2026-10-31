import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  IdCard,
  Pencil,
  Save,
  X,
  ShieldCheck,
  Camera,
  Contact,
} from "lucide-react";

import "./MyProfile.css";

function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("OrgConnect-demo-user") || "null");
  } catch {
    return null;
  }
}

function getProfileKey(user) {
  const identifier = user?.email || user?.id || user?.employeeId || "current";
  return `OrgConnect-employee-profile-${identifier}`;
}

function getInitialProfile(user) {
  const key = getProfileKey(user);

  try {
    const savedProfile = sessionStorage.getItem(key);

    if (savedProfile) {
      return {
        ...createDefaultProfile(user),
        ...JSON.parse(savedProfile),
      };
    }
  } catch {
    // Use the session user details if saved profile data is unavailable.
  }

  return createDefaultProfile(user);
}

function createDefaultProfile(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    alternatePhone: user?.alternatePhone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    postalCode: user?.postalCode || "",
    employeeId: user?.employeeId || "Not provided",
    department: user?.department || "Not provided",
    designation: user?.designation || "Not provided",
    joiningDate: user?.joiningDate || "",
    employmentType: user?.employmentType || "Not provided",
    reportingManager: user?.reportingManager || "Not provided",
  };
}

function formatDate(date) {
  if (!date) return "Not provided";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MyProfile() {
  const user = getSessionUser();

  const [profile, setProfile] = useState(() => getInitialProfile(user));
  const [form, setForm] = useState(() => getInitialProfile(user));
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const updatedProfile = getInitialProfile(user);
    setProfile(updatedProfile);
    setForm(updatedProfile);
  }, [user?.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEdit = () => {
    setForm({ ...profile });
    setEditing(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setEditing(false);
    setErrorMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const phonePattern = /^[0-9+\-\s()]{7,20}$/;

    if (form.phone && !phonePattern.test(form.phone)) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    if (form.alternatePhone && !phonePattern.test(form.alternatePhone)) {
      setErrorMessage("Please enter a valid alternate phone number.");
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
      };

      sessionStorage.setItem(
        getProfileKey(user),
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setEditing(false);
      setSuccessMessage("Your profile has been updated successfully.");

      // Keep the workspace header name in sync with the updated profile.
      if (user) {
        sessionStorage.setItem(
          "OrgConnect-demo-user",
          JSON.stringify({
            ...user,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
          })
        );
      }
    } catch {
      setErrorMessage("Unable to save your profile. Please try again.");
    }
  };

  const initials = (profile.name || "Employee")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const personalFields = [
    {
      label: "Full Name",
      name: "name",
      icon: UserRound,
      editable: true,
      required: true,
    },
    {
      label: "Email Address",
      name: "email",
      icon: Mail,
      editable: true,
      required: true,
      type: "email",
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      editable: true,
      type: "tel",
    },
    {
      label: "Alternate Phone",
      name: "alternatePhone",
      icon: Contact,
      editable: true,
      type: "tel",
    },
  ];

  const employmentFields = [
    {
      label: "Employee ID",
      value: profile.employeeId,
      icon: IdCard,
    },
    {
      label: "Department",
      value: profile.department,
      icon: Building2,
    },
    {
      label: "Designation",
      value: profile.designation,
      icon: BriefcaseBusiness,
    },
    {
      label: "Joining Date",
      value: formatDate(profile.joiningDate),
      icon: CalendarDays,
    },
    {
      label: "Employment Type",
      value: profile.employmentType,
      icon: Contact,
    },
    {
      label: "Reporting Manager",
      value: profile.reportingManager,
      icon: UserRound,
    },
  ];

  return (
    <section className="employee-profile-page">
      <div className="employee-profile-heading">
        <div>
          <span className="employee-eyebrow">EMPLOYEE ACCOUNT</span>
          <h1>My Profile</h1>
          <p>View and manage your personal and professional information.</p>
        </div>

        {!editing ? (
          <button className="employee-profile-edit-btn" onClick={handleEdit}>
            <Pencil size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="employee-profile-heading-actions">
            <button
              className="employee-profile-cancel-btn"
              onClick={handleCancel}
              type="button"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              className="employee-profile-save-btn"
              type="submit"
              form="employee-profile-form"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="employee-profile-alert success">
          <ShieldCheck size={18} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="employee-profile-alert error">
          {errorMessage}
        </div>
      )}

      <form id="employee-profile-form" onSubmit={handleSave}>
        <section className="employee-profile-card employee-profile-overview">
          <div className="employee-profile-avatar">
            {initials || <UserRound size={34} />}
            <span className="employee-profile-avatar-status" />
          </div>

          <div className="employee-profile-overview-info">
            <h2>{profile.name || "Employee Name"}</h2>
            <p>{profile.designation}</p>
            <span className="employee-profile-id">
              <IdCard size={14} />
              {profile.employeeId}
            </span>
          </div>

          <div className="employee-profile-status">
            <span className="employee-profile-status-dot" />
            Employee Account
          </div>
        </section>

        <section className="employee-profile-card">
          <div className="employee-profile-section-heading">
            <div className="employee-profile-section-icon">
              <UserRound size={19} />
            </div>
            <div>
              <h2>Personal Information</h2>
              <p>Your personal and contact details</p>
            </div>
          </div>

          <div className="employee-profile-fields">
            {personalFields.map((field) => {
              const Icon = field.icon;

              return (
                <div className="employee-profile-field" key={field.name}>
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="employee-profile-required"> *</span>
                    )}
                  </label>

                  <div className="employee-profile-input-wrap">
                    <Icon size={17} />

                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || "text"}
                      value={form[field.name] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      readOnly={!editing || !field.editable}
                      required={field.required}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="employee-profile-card">
          <div className="employee-profile-section-heading">
            <div className="employee-profile-section-icon">
              <MapPin size={19} />
            </div>
            <div>
              <h2>Address Information</h2>
              <p>Your current residential address</p>
            </div>
          </div>

          <div className="employee-profile-fields">
            <div className="employee-profile-field full-width">
              <label htmlFor="address">Address</label>
              <div className="employee-profile-input-wrap">
                <MapPin size={17} />
                <input
                  id="address"
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  readOnly={!editing}
                />
              </div>
            </div>

            <div className="employee-profile-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                placeholder="Enter city"
                readOnly={!editing}
              />
            </div>

            <div className="employee-profile-field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                value={form.state || ""}
                onChange={handleChange}
                placeholder="Enter state"
                readOnly={!editing}
              />
            </div>

            <div className="employee-profile-field">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                name="postalCode"
                value={form.postalCode || ""}
                onChange={handleChange}
                placeholder="Enter postal code"
                readOnly={!editing}
              />
            </div>
          </div>
        </section>

        <section className="employee-profile-card">
          <div className="employee-profile-section-heading">
            <div className="employee-profile-section-icon">
              <BriefcaseBusiness size={19} />
            </div>
            <div>
              <h2>Employment Information</h2>
              <p>Your company and job details</p>
            </div>
          </div>

          <div className="employee-profile-fields">
            {employmentFields.map((field) => {
              const Icon = field.icon;

              return (
                <div className="employee-profile-field" key={field.label}>
                  <label>{field.label}</label>
                  <div className="employee-profile-readonly">
                    <Icon size={17} />
                    <span>{field.value || "Not provided"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="employee-profile-readonly-note">
            <ShieldCheck size={16} />
            Employment details are managed by your company administrator.
          </div>
        </section>

        {editing && (
          <div className="employee-profile-bottom-actions">
            <button
              className="employee-profile-cancel-btn"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button className="employee-profile-save-btn" type="submit">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </section>
  );
}