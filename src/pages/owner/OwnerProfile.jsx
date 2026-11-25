
import { useEffect, useState, useRef } from "react";

import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Pencil,
  Save,
  X,
  Camera,
} from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import "./OwnerProfile.css";

// ==================== EMPTY PROFILE ====================

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
  profileImageUrl: "",
};

// ==================== ERROR HANDLER ====================

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

// ==================== RESPONSE HANDLER ====================

const getProfileData = (response) => {
  return response?.data?.profile || response?.data || {};
};

const BACKEND_URL = "http://localhost:8080";

const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${BACKEND_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

// ==================== COMPONENT ====================

function OwnerProfile() {

  // ==================== PROFILE STATES ====================

  const [profile, setProfile] = useState(emptyProfile);

  const [originalProfile, setOriginalProfile] =
    useState(emptyProfile);

  const [loading, setLoading] = useState(true);

  // Personal information saving state
  const [saving, setSaving] = useState(false);

  // Image uploading state
  const [imageUploading, setImageUploading] = useState(false);

  // Personal information editing state
  const [isEditing, setIsEditing] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Image states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  // ==================== AUTHENTICATION ====================

  const getLoggedInUser = () => {
    try {
      const authData = sessionStorage.getItem("orgconnect-auth");

      return authData ? JSON.parse(authData) : {};

    } catch (error) {
      console.error(
        "Unable to read authentication details:",
        error
      );

      return {};
    }
  };

  const loggedInUser = getLoggedInUser();

  const companyId = loggedInUser.companyId;

  // ==================== API ENDPOINTS ====================

  const PROFILE_API = "/api/company-owner/profile";

  const IMAGE_API = "/api/company-owner/profile/image";

  // ==================== FETCH OWNER PROFILE ====================

  const fetchOwnerProfile = async () => {

    try {

      setLoading(true);
      setError("");

      if (!companyId) {
        throw new Error(
          "Company ID is missing from your login session. Please logout and login again."
        );
      }

      const response = await axiosInstance.get(
        PROFILE_API,
        {
          params: {
            companyId: companyId,
          },
        }
      );

      const data = getProfileData(response);

      const mappedProfile = {
        ...emptyProfile,
        ...data,
        companyId: data.companyId ?? companyId,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        profileImageUrl: data.profileImageUrl || "",
      };

      setProfile(mappedProfile);

      setOriginalProfile(mappedProfile);

    } catch (err) {

      console.error("Fetch profile error:", err);

      setError(getErrorMessage(err));

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchOwnerProfile();

    return () => {

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

    };

  }, []);

  // ==================== PROFILE INITIAL ====================

  const getInitial = () => {

    return (
      profile.name?.trim()?.charAt(0)?.toUpperCase() || "O"
    );

  };

  // ==================== FORMAT DATE ====================

  const formatDate = (date) => {

    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  };

  // ==================================================
  // PERSONAL INFORMATION OPERATIONS
  // ==================================================

  // ==================== EDIT PERSONAL INFORMATION ====================

  const handleEdit = () => {

    setIsEditing(true);

    setError("");
    setSuccessMsg("");

  };

  // ==================== HANDLE PERSONAL INPUT CHANGE ====================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // ==================== CANCEL PERSONAL INFORMATION EDIT ====================

  const handleCancel = () => {

    setProfile((previous) => ({
      ...originalProfile,
      profileImageUrl: previous.profileImageUrl,
    }));

    setIsEditing(false);

    setError("");
    setSuccessMsg("");

  };

  // ==================== SAVE PERSONAL INFORMATION ====================

  const handleSave = async () => {

    try {

      setSaving(true);

      setError("");
      setSuccessMsg("");

      if (!companyId) {
        throw new Error(
          "Company ID not found. Please login again."
        );
      }

      if (!profile.name.trim()) {
        throw new Error("Full name is required.");
      }

      if (!profile.phone.trim()) {
        throw new Error("Mobile number is required.");
      }

      // PUT request updates personal information ONLY.
      // Profile image API is NOT called here.

      const response = await axiosInstance.put(
        PROFILE_API,
        {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
        },
        {
          params: {
            companyId: companyId,
          },
        }
      );

      const updatedData = getProfileData(response);

      // Update only personal information fields.
      // Preserve existing profile image independently.

      const updatedProfile = {
        ...profile,
        name: updatedData.name ?? profile.name.trim(),
        phone: updatedData.phone ?? profile.phone.trim(),
        profileImageUrl: profile.profileImageUrl,
      };

      setProfile(updatedProfile);

      setOriginalProfile((previous) => ({
        ...previous,
        ...updatedProfile,
      }));

      setIsEditing(false);

      setSuccessMsg(
        "Personal information updated successfully!"
      );

    } catch (err) {

      console.error("Personal information update error:", err);

      setError(getErrorMessage(err));

    } finally {

      setSaving(false);

    }

  };

  // ==================================================
  // PROFILE IMAGE OPERATIONS
  // ==================================================

  // ==================== OPEN IMAGE SELECTOR ====================

  const handleImageClick = () => {

    if (!imageUploading) {
      fileInputRef.current?.click();
    }

  };

  // ==================== SELECT IMAGE ====================

  const handleFileChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    // Validate image type

    if (!allowedTypes.includes(file.type)) {

      setError(
        "Please select a JPG, PNG, or WEBP image."
      );

      event.target.value = "";

      return;
    }

    // Validate image size: 2 MB

    if (file.size > 2 * 1024 * 1024) {

      setError(
        "Image size should not exceed 2 MB."
      );

      event.target.value = "";

      return;
    }

    // Remove previous preview URL

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);

    setPreviewUrl(newPreviewUrl);

    setError("");
    setSuccessMsg("");

  };

  // ==================== CANCEL IMAGE SELECTION ====================

  const handleCancelImage = () => {

    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccessMsg("");

  };

  // ==================== UPLOAD PROFILE IMAGE ====================

  const handleUploadImage = async () => {

    if (!selectedFile) {

      setError("Please select an image first.");

      return;
    }

    try {

      setImageUploading(true);

      setError("");
      setSuccessMsg("");

      if (!companyId) {
        throw new Error(
          "Company ID not found. Please login again."
        );
      }

      const formData = new FormData();

      formData.append("file", selectedFile);

      // POST request uploads profile image ONLY.
      // Personal information API is NOT called here.

      const response = await axiosInstance.post(
        IMAGE_API,
        formData,
        {
          params: {
            companyId: companyId,
          },
        }
      );

      const imageData = getProfileData(response);

      // Only update the image URL.
      // Do not overwrite name, phone, email, or other details.

      const updatedImageUrl =
        imageData.profileImageUrl || "";

      if (!updatedImageUrl) {
        throw new Error(
          "Image uploaded, but the server did not return profileImageUrl. Please verify the backend response."
        );
      }

      setProfile((previous) => ({
        ...previous,
        profileImageUrl: updatedImageUrl,
      }));

      setOriginalProfile((previous) => ({
        ...previous,
        profileImageUrl: updatedImageUrl,
      }));

      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMsg(
        "Profile image updated successfully!"
      );

    } catch (err) {

      console.error("Profile image upload error:", err);

      setError(getErrorMessage(err));

    } finally {

      setImageUploading(false);

    }

  };

  // ==================== DISPLAY PROFILE IMAGE ====================

  const displayImage =
    previewUrl || profile.profileImageUrl || "";

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="owner-profile-page">

        <div className="owner-profile-heading">

          <div>

            <span className="owner-profile-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h1>My Profile</h1>

            <p>
              Loading your account information...
            </p>

          </div>

        </div>

      </div>

    );

  }

  // ==================================================
  // INITIAL FETCH ERROR
  // ==================================================

  if (error && !profile.id) {

    return (

      <div className="owner-profile-page">

        <div className="owner-profile-heading">

          <div>

            <span className="owner-profile-eyebrow">
              ACCOUNT MANAGEMENT
            </span>

            <h1>My Profile</h1>

          </div>

        </div>

        <p
          className="owner-profile-error"
          role="alert"
        >
          {error}
        </p>

        <button
          type="button"
          className="owner-profile-primary-btn"
          onClick={fetchOwnerProfile}
        >
          Retry
        </button>

      </div>

    );

  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (

    <div className="owner-profile-page">

      {/* ==================== PAGE HEADER ==================== */}

      <div className="owner-profile-heading">

        <div>

          <span className="owner-profile-eyebrow">
            ACCOUNT MANAGEMENT
          </span>

          <h1>My Profile</h1>

          <p>
            View and update your personal account information.
          </p>

        </div>

        {!isEditing ? (

          <button
            type="button"
            className="owner-profile-edit-btn"
            onClick={handleEdit}
          >

            <Pencil size={16} />

            Edit Profile

          </button>

        ) : (

          <div className="owner-profile-edit-actions">

            <button
              type="button"
              className="owner-profile-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >

              <X size={16} />

              Cancel

            </button>

            <button
              type="button"
              className="owner-profile-save-btn"
              onClick={handleSave}
              disabled={saving}
            >

              <Save size={16} />

              {saving ? "Saving..." : "Save Changes"}

            </button>

          </div>

        )}

      </div>

      {/* ==================== SUCCESS MESSAGE ==================== */}

      {successMsg && (

        <p className="owner-profile-success-msg">
          {successMsg}
        </p>

      )}

      {/* ==================== ERROR MESSAGE ==================== */}

      {error && (

        <p
          className="owner-profile-error"
          role="alert"
        >
          {error}
        </p>

      )}

      {/* ==================== PROFILE LAYOUT ==================== */}

      <div className="owner-profile-layout">

        {/* ==================== SIDEBAR ==================== */}

        <aside className="owner-profile-sidebar-card">

          {/* PROFILE IMAGE */}

          <div className="owner-profile-photo-wrapper">

            <div
              className="owner-profile-photo editable"
              onClick={handleImageClick}
              title="Click to change profile photo"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  handleImageClick();
                }
              }}
            >

              {displayImage ? (

                // <img
                //   src={displayImage}
                //   alt="Owner profile"
                //   className="owner-profile-img"
                // />

                <img
  src={
    getProfileImageUrl(profile.profileImageUrl) ||
    defaultProfileImage
  }
  alt="Owner profile"
  className="owner-profile-img"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = defaultProfileImage;
  }}
/>

              ) : (

                <span>
                  {getInitial()}
                </span>

              )}

              <div className="owner-profile-photo-overlay">

                <Camera size={22} />

                <span>Change</span>

              </div>

            </div>

            {/* HIDDEN IMAGE INPUT */}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* IMAGE UPLOAD BUTTONS */}

            {selectedFile && (

              <div className="owner-profile-image-actions">

                <button
                  type="button"
                  className="owner-profile-save-btn"
                  onClick={handleUploadImage}
                  disabled={imageUploading}
                >

                  <Camera size={16} />

                  {imageUploading
                    ? "Uploading..."
                    : "Upload Photo"}

                </button>

                <button
                  type="button"
                  className="owner-profile-cancel-btn"
                  onClick={handleCancelImage}
                  disabled={imageUploading}
                >

                  <X size={16} />

                  Cancel Photo

                </button>

              </div>

            )}

          </div>

          {/* OWNER DETAILS */}

          <h2>
            {profile.name || "Company Owner"}
          </h2>

          <p className="owner-profile-designation">
            Company Owner
          </p>

          <span className="owner-profile-role">

            <ShieldCheck size={14} />

            {profile.role || "COMPANY_OWNER"}

          </span>

          <div className="owner-profile-side-divider" />

          <div className="owner-profile-side-info">

            <Mail size={16} />

            <span>
              {profile.email || "Not available"}
            </span>

          </div>

          <div className="owner-profile-side-info">

            <Phone size={16} />

            <span>
              {profile.phone || "Not available"}
            </span>

          </div>

          <div className="owner-profile-side-info">

            <BriefcaseBusiness size={16} />

            <span>Company Owner</span>

          </div>

        </aside>

        {/* ==================== PROFILE DETAILS ==================== */}

        <div className="owner-profile-details">

          {/* ==================== PERSONAL INFORMATION ==================== */}

          <section className="owner-profile-section">

            <div className="owner-profile-section-heading">

              <div className="owner-profile-section-icon">

                <UserRound size={19} />

              </div>

              <div>

                <h3>Personal Information</h3>

                <p>
                  Your registered account details.
                </p>

              </div>

            </div>

            <div className="owner-profile-fields">

              {/* FULL NAME */}

              <label>

                Full Name

                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />

              </label>

              {/* EMAIL */}

              <label>

                Email Address

                <input
                  type="email"
                  value={profile.email || ""}
                  readOnly
                />

              </label>

              {/* PHONE */}

              <label>

                Mobile Number

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />

              </label>

              {/* ROLE */}

              <label>

                Account Role

                <input
                  value={profile.role || "COMPANY_OWNER"}
                  readOnly
                />

              </label>

              {/* STATUS */}

              <label>

                Account Status

                <input
                  value={
                    profile.accountStatus || "Not available"
                  }
                  readOnly
                />

              </label>

              {/* REGISTRATION DATE */}

              <label>

                Date of Registration

                <input
                  value={formatDate(profile.createdAt)}
                  readOnly
                />

              </label>

            </div>

          </section>

          {/* ==================== ORGANIZATION INFORMATION ==================== */}

          <section className="owner-profile-section">

            <div className="owner-profile-section-heading">

              <div className="owner-profile-section-icon">

                <BriefcaseBusiness size={19} />

              </div>

              <div>

                <h3>Organization Information</h3>

                <p>
                  Your company account association.
                </p>

              </div>

            </div>

            <div className="owner-profile-fields">

              <label>

                Company ID

                <input
                  value={profile.companyId ?? ""}
                  readOnly
                />

              </label>

              <label>

                User ID

                <input
                  value={profile.id ?? ""}
                  readOnly
                />

              </label>

            </div>

          </section>

          {/* ==================== EMAIL VERIFICATION ==================== */}

          <p className="owner-profile-success">

            <CheckCircle2 size={17} />

            {profile.emailVerified
              ? "Your email address is verified."
              : "Your email address is not verified yet."}

          </p>

        </div>

      </div>

      {/* ==================== ACCOUNT NOTE ==================== */}

      <div className="owner-profile-account-note">

        <ShieldCheck size={18} />

        <div>

          <strong>Account Role: Owner</strong>

          <p>
            You have owner-level access to this organization workspace.
          </p>

        </div>

      </div>

    </div>

  );

}

export default OwnerProfile;
