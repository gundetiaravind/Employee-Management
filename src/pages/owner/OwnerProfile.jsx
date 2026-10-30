
import { useRef, useState } from "react";
import {
  Camera,
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  Pencil,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import "./OwnerProfile.css";

const initialProfile = {
  name: "Company Owner",
  email: "owner@orgconnect.com",
  phone: "9876543210",
  gender: "Male",
  dob: "1998-06-15",
  designation: "Company Owner",
  department: "Management",
  joined: "2026-01-01",
  address: "Hitech City",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  pin: "500081",
};

function OwnerProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [photo, setPhoto] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile image must be smaller than 2 MB.");
      return;
    }

    setError("");
    setPhoto(URL.createObjectURL(file));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(profile.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(profile.pin)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setEditing(false);
    setSaved(true);
  };

  const cancelEditing = () => {
    setProfile(profile);
    setEditing(false);
    setError("");
  };

  return (
    <div className="owner-profile-page">
      <div className="owner-profile-heading">
        <div>
          <span className="owner-profile-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>My Profile</h1>
          <p>View and manage your personal account information.</p>
        </div>

        {!editing ? (
          <button
            className="owner-profile-primary-btn"
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        ) : (
          <button
            className="owner-profile-cancel-btn"
            onClick={cancelEditing}
          >
            <X size={17} />
            Cancel
          </button>
        )}
      </div>

      <div className="owner-profile-layout">
        <aside className="owner-profile-sidebar-card">
          <div className="owner-profile-photo-wrapper">
            <div className="owner-profile-photo">
              {photo ? (
                <img src={photo} alt="Owner profile" />
              ) : (
                <span>{profile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {editing && (
              <button
                type="button"
                className="owner-profile-camera"
                onClick={() => photoInputRef.current?.click()}
                title="Change profile photo"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhoto}
          />

          <h2>{profile.name}</h2>
          <p className="owner-profile-designation">{profile.designation}</p>

          <span className="owner-profile-role">
            <ShieldCheck size={14} />
            OWNER
          </span>

          <div className="owner-profile-side-divider" />

          <div className="owner-profile-side-info">
            <Mail size={16} />
            <span>{profile.email}</span>
          </div>

          <div className="owner-profile-side-info">
            <Phone size={16} />
            <span>{profile.phone}</span>
          </div>

          <div className="owner-profile-side-info">
            <MapPin size={16} />
            <span>{profile.city}, {profile.state}</span>
          </div>

          <div className="owner-profile-side-info">
            <BriefcaseBusiness size={16} />
            <span>{profile.department}</span>
          </div>
        </aside>

        <form className="owner-profile-details" onSubmit={saveProfile}>
          <section className="owner-profile-section">
            <div className="owner-profile-section-heading">
              <div className="owner-profile-section-icon">
                <UserRound size={19} />
              </div>
              <div>
                <h3>Personal Information</h3>
                <p>Your basic personal details.</p>
              </div>
            </div>

            <div className="owner-profile-fields">
              <label>
                Full Name
                <input
                  name="name"
                  value={profile.name}
                  onChange={updateField}
                  disabled={!editing}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={updateField}
                  disabled={!editing}
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={updateField}
                  disabled={!editing}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </label>

              <label>
                Date of Birth
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={updateField}
                  disabled={!editing}
                />
              </label>

              <label>
                Gender
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={updateField}
                  disabled={!editing}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
            </div>
          </section>

          <section className="owner-profile-section">
            <div className="owner-profile-section-heading">
              <div className="owner-profile-section-icon">
                <BriefcaseBusiness size={19} />
              </div>
              <div>
                <h3>Professional Information</h3>
                <p>Your role and organization details.</p>
              </div>
            </div>

            <div className="owner-profile-fields">
              <label>
                Designation
                <input
                  name="designation"
                  value={profile.designation}
                  onChange={updateField}
                  disabled={!editing}
                />
              </label>

              <label>
                Department
                <input
                  name="department"
                  value={profile.department}
                  onChange={updateField}
                  disabled={!editing}
                />
              </label>

              <label>
                Date of Joining
                <input
                  type="date"
                  name="joined"
                  value={profile.joined}
                  disabled
                />
              </label>
            </div>
          </section>

          

          {error && <p className="owner-profile-error">{error}</p>}

          {saved && (
            <p className="owner-profile-success">
              <CheckCircle2 size={17} />
              Profile updated successfully.
            </p>
          )}

          {editing && (
            <div className="owner-profile-save-actions">
              <button
                type="button"
                className="owner-profile-cancel-btn"
                onClick={cancelEditing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="owner-profile-primary-btn"
              >
                <Save size={17} />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="owner-profile-account-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Account Role: Owner</strong>
          <p>You have owner-level access to this organization workspace.</p>
        </div>
      </div>
    </div>
  );
}

export default OwnerProfile;
