import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import "./OwnerProfile.css";

const emptyProfile = {
  id: null,
  companyId: null,
  name: "",
  email: "",
  phone: "",
  role: "",
  accountStatus: "",
  emailVerified: false,
  createdAt: "",
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Unable to load owner profile. Please try again.";

function OwnerProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get("/api/company/profile");

        const data = response.data?.profile || response.data;

        setProfile({
          ...emptyProfile,
          ...data,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerProfile();
  }, []);

  const getInitial = () =>
    profile.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="owner-profile-page">
        <div className="owner-profile-heading">
          <div>
            <span className="owner-profile-eyebrow">ACCOUNT MANAGEMENT</span>
            <h1>My Profile</h1>
            <p>Loading your account information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-profile-page">
        <div className="owner-profile-heading">
          <div>
            <span className="owner-profile-eyebrow">ACCOUNT MANAGEMENT</span>
            <h1>My Profile</h1>
          </div>
        </div>

        <p className="owner-profile-error" role="alert">
          {error}
        </p>

        <button
          className="owner-profile-primary-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="owner-profile-page">
      <div className="owner-profile-heading">
        <div>
          <span className="owner-profile-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>My Profile</h1>
          <p>View your personal account information.</p>
        </div>
      </div>

      <div className="owner-profile-layout">
        <aside className="owner-profile-sidebar-card">
          <div className="owner-profile-photo-wrapper">
            <div className="owner-profile-photo">
              <span>{getInitial()}</span>
            </div>
          </div>

          <h2>{profile.name || "Company Owner"}</h2>

          <p className="owner-profile-designation">Company Owner</p>

          <span className="owner-profile-role">
            <ShieldCheck size={14} />
            {profile.role || "OWNER"}
          </span>

          <div className="owner-profile-side-divider" />

          <div className="owner-profile-side-info">
            <Mail size={16} />
            <span>{profile.email || "Not available"}</span>
          </div>

          <div className="owner-profile-side-info">
            <Phone size={16} />
            <span>{profile.phone || "Not available"}</span>
          </div>

          <div className="owner-profile-side-info">
            <BriefcaseBusiness size={16} />
            <span>Company Owner</span>
          </div>
        </aside>

        <div className="owner-profile-details">
          <section className="owner-profile-section">
            <div className="owner-profile-section-heading">
              <div className="owner-profile-section-icon">
                <UserRound size={19} />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Your registered account details.</p>
              </div>
            </div>

            <div className="owner-profile-fields">
              <label>
                Full Name
                <input value={profile.name} disabled />
              </label>

              <label>
                Email Address
                <input value={profile.email} disabled />
              </label>

              <label>
                Mobile Number
                <input value={profile.phone || ""} disabled />
              </label>

              <label>
                Account Role
                <input value={profile.role || ""} disabled />
              </label>

              <label>
                Account Status
                <input value={profile.accountStatus || ""} disabled />
              </label>

              <label>
                Date of Registration
                <input value={formatDate(profile.createdAt)} disabled />
              </label>
            </div>
          </section>

          <section className="owner-profile-section">
            <div className="owner-profile-section-heading">
              <div className="owner-profile-section-icon">
                <BriefcaseBusiness size={19} />
              </div>

              <div>
                <h3>Organization Information</h3>
                <p>Your company account association.</p>
              </div>
            </div>

            <div className="owner-profile-fields">
              <label>
                Company ID
                <input value={profile.companyId ?? ""} disabled />
              </label>

              <label>
                User ID
                <input value={profile.id ?? ""} disabled />
              </label>
            </div>
          </section>

          <p className="owner-profile-success">
            <CheckCircle2 size={17} />
            {profile.emailVerified
              ? "Your email address is verified."
              : "Your email address is not verified yet."}
          </p>
        </div>
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
