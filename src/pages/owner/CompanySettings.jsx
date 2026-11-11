
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
const AUTH_KEY = "orgconnect-auth";
import axiosInstance from "../../utils/axiosInstance";
import "./CompanySettings.css";
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
const API = {
  getSettings: `/api/company/settings?companyId=${COMPANY_ID}`,
  updateSettings: `/api/company/settings?companyId=${COMPANY_ID}`,
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

// Convert backend response into the frontend form structure.
const mapCompanyResponse = (data) => ({
  companyName: data.companyName || "",
  companyEmail: data.companyEmail || "",
  contactNumber: data.contactNumber || "",
  website: data.website || "",
  industry: data.industry || "",
  companyType: data.companyType || "",
  address: data.address || "",
  city: data.city || "",
  state: data.state || "",
  country: data.country || "",
  pinCode: data.pinCode || "",
});

function CompanySettings() {
  const [company, setCompany] = useState(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // GET: Load company settings
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

  // PUT: Update company settings
  const saveSettings = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const phone = company.contactNumber.trim();
    const pin = company.pinCode.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (pin && !/^\d{6}$/.test(pin)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setSaving(true);

      // Use backend property names in the request.
      const payload = {
        companyName: company.companyName.trim(),
        companyEmail: company.companyEmail.trim(),
        contactNumber: phone,
        website: company.website.trim() || null,
        industry: company.industry.trim(),
        companyType: company.companyType.trim(),
        address: company.address.trim(),
        city: company.city.trim(),
        state: company.state.trim(),
        country: company.country.trim(),
        pinCode: pin,
      };

      const response = await axiosInstance.put(
        API.updateSettings,
        payload
      );

      const data = response.data?.company || response.data;

      // Use the latest values returned by the backend.
      setCompany(mapCompanyResponse(data));
      setSaved(true);
      setSuccessMessage("Company settings updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  // Reset the form by fetching the latest saved backend values.
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
          <p>
            Manage your organization information and company preferences.
          </p>
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
              Industry *
              <select
                name="industry"
                value={company.industry}
                onChange={updateField}
                required
              >
                <option value="">Select Industry</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Company Type
              <input
                name="companyType"
                value={company.companyType}
                onChange={updateField}
                placeholder="Example: Private Limited"
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
              Company Email *
              <div className="company-input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  name="companyEmail"
                  value={company.companyEmail}
                  onChange={updateField}
                  placeholder="company@example.com"
                  required
                />
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
              City *
              <input
                name="city"
                value={company.city}
                onChange={updateField}
                placeholder="Enter city"
                required
              />
            </label>

            <label>
              State *
              <input
                name="state"
                value={company.state}
                onChange={updateField}
                placeholder="Enter state"
                required
              />
            </label>

            <label>
              Country *
              <input
                name="country"
                value={company.country}
                onChange={updateField}
                placeholder="Enter country"
                required
              />
            </label>

            <label>
              PIN Code *
              <input
                name="pinCode"
                value={company.pinCode}
                onChange={updateField}
                placeholder="6-digit PIN code"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
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

          <button
            type="submit"
            className="company-save-btn"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanySettings;
