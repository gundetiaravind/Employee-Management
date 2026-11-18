import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import "./CompanySettings.css";

const API = {
  getSettings: "/api/company/settings",
  updateSettings: "/api/company/settings",
};

const emptyCompany = {
  companyName: "",
  companyEmail: "",
  contactNumber: "",
  website: "",
  industry: "",
  companyType: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

const mapCompanyResponse = (data) => ({
  companyName: data?.companyName || "",
  companyEmail: data?.companyEmail || "",
  contactNumber: data?.contactNumber || "",
  website: data?.website || "",
  industry: data?.industry || "",
  companyType: data?.companyType || "",
  address: data?.address || "",
  city: data?.city || "",
  state: data?.state || "",
  country: data?.country || "",
  pinCode: data?.pinCode || "",
});

function CompanySettings() {
  const [company, setCompany] = useState(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await axiosInstance.get(API.getSettings);
      const data = response.data?.company || response.data;

      setCompany(mapCompanyResponse(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;

    setCompany((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setSuccessMessage("");
    setError("");
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const phone = company.contactNumber.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSaving(true);

      // These are the four fields supported by the backend DTO.
      const payload = {
        companyName: company.companyName.trim(),
        contactNumber: phone,
        address: company.address.trim(),
        website: company.website.trim(),
      };

      const response = await axiosInstance.put(API.updateSettings, payload);

      const data = response.data?.company || response.data;

      setCompany((current) => ({
        ...current,
        ...mapCompanyResponse(data),
      }));

      setSaved(true);
      setSuccessMessage("Company settings updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    fetchCompanySettings();
    setSaved(false);
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div className="company-settings-page">
        <div className="company-settings-heading">
          <div>
            <span className="company-settings-eyebrow">
              ORGANIZATION MANAGEMENT
            </span>
            <h1>Company Settings</h1>
            <p>Loading company information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="company-settings-page">
      <div className="company-settings-heading">
        <div>
          <span className="company-settings-eyebrow">
            ORGANIZATION MANAGEMENT
          </span>
          <h1>Company Settings</h1>
          <p>Manage your organization information and company preferences.</p>
        </div>
      </div>

      {error && (
        <div className="company-error-message" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="company-saved-message">
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      )}

      <form onSubmit={saveSettings}>
        {/* Company Information */}
        <section className="company-settings-card">
          <div className="company-section-heading">
            <div className="company-section-icon">
              <Building2 size={19} />
            </div>
            <div>
              <h2>Company Information</h2>
              <p>Basic details about your organization.</p>
            </div>
          </div>

          <div className="company-form-grid">
            <label>
              Company Name *
              <input
                name="companyName"
                value={company.companyName}
                onChange={updateField}
                placeholder="Enter company name"
                required
              />
            </label>

            <label>
              Industry
              <input
                value={company.industry}
                disabled
                title="Industry editing is not supported by the current backend."
              />
            </label>

            <label>
              Company Type
              <input
                value={company.companyType}
                disabled
                title="Company type editing is not supported by the current backend."
              />
            </label>

            <label>
              Website
              <div className="company-input-icon">
                <Globe size={16} />
                <input
                  type="url"
                  name="website"
                  value={company.website}
                  onChange={updateField}
                  placeholder="https://company.com"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Contact Information */}
        <section className="company-settings-card">
          <div className="company-section-heading">
            <div className="company-section-icon">
              <Mail size={19} />
            </div>
            <div>
              <h2>Contact Information</h2>
              <p>Official contact details for your organization.</p>
            </div>
          </div>

          <div className="company-form-grid">
            <label>
              Company Email
              <div className="company-input-icon">
                <Mail size={16} />
                <input type="email" value={company.companyEmail} disabled />
              </div>
            </label>

            <label>
              Company Phone *
              <div className="company-input-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  name="contactNumber"
                  value={company.contactNumber}
                  onChange={updateField}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>
            </label>
          </div>
        </section>

        {/* Office Address */}
        <section className="company-settings-card">
          <div className="company-section-heading">
            <div className="company-section-icon">
              <MapPin size={19} />
            </div>
            <div>
              <h2>Office Address</h2>
              <p>Registered or primary office address.</p>
            </div>
          </div>

          <div className="company-form-grid">
            <label className="company-full-width">
              Address *
              <input
                name="address"
                value={company.address}
                onChange={updateField}
                placeholder="Enter office address"
                required
              />
            </label>

            <label>
              City
              <input value={company.city} disabled />
            </label>

            <label>
              State
              <input value={company.state} disabled />
            </label>

            <label>
              Country
              <input value={company.country} disabled />
            </label>

            <label>
              PIN Code
              <input value={company.pinCode} disabled />
            </label>
          </div>
        </section>

        {/* Form Actions */}
        <div className="company-settings-actions">
          {saved && (
            <span className="company-saved-message">
              <CheckCircle2 size={17} />
              Changes saved successfully
            </span>
          )}

          <button
            type="button"
            className="company-reset-btn"
            onClick={resetSettings}
            disabled={saving}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="submit" className="company-save-btn" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanySettings;
