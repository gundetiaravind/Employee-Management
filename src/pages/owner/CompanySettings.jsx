
import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
} from "lucide-react";
import "./CompanySettings.css";

const initialCompany = {
  name: "OrgConnect Technologies",
  code: "ORG482916",
  email: "contact@orgconnect.com",
  phone: "9876543210",
  website: "www.orgconnect.com",
  industry: "Information Technology",
  size: "51–200 Employees",
  address: "Hitech City",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  pin: "500081",
  description:
    "An organization focused on building technology solutions and providing a collaborative workplace.",
};

function CompanySettings() {
  const [company, setCompany] = useState(initialCompany);
  const [saved, setSaved] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setCompany((current) => ({ ...current, [name]: value }));
    setSaved(false);
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  const resetSettings = () => {
    setCompany(initialCompany);
    setSaved(false);
  };

  const copyCompanyCode = async () => {
    try {
      await navigator.clipboard.writeText(company.code);
      window.alert("Company code copied.");
    } catch {
      window.alert("Unable to copy the company code.");
    }
  };

  return (
    <div className="company-settings-page">
      <div className="company-settings-heading">
        <div>
          <span className="company-settings-eyebrow">ORGANIZATION MANAGEMENT</span>
          <h1>Company Settings</h1>
          <p>Manage your organization information and company preferences.</p>
        </div>
      </div>

      <div className="company-code-card">
        <div className="company-code-icon">
          <Hash size={22} />
        </div>
        <div className="company-code-info">
          <span>YOUR COMPANY CODE</span>
          <strong>{company.code}</strong>
          <p>Share this code with employees who need to join your organization.</p>
        </div>
        <button className="company-copy-btn" onClick={copyCompanyCode}>
          <Copy size={16} />
          Copy Code
        </button>
      </div>

      <form onSubmit={saveSettings}>
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
                name="name"
                value={company.name}
                onChange={updateField}
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
                <option>Information Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Manufacturing</option>
                <option>Retail</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Company Size *
              <select
                name="size"
                value={company.size}
                onChange={updateField}
                required
              >
                <option>1–10 Employees</option>
                <option>11–50 Employees</option>
                <option>51–200 Employees</option>
                <option>201–500 Employees</option>
                <option>501–1000 Employees</option>
                <option>1000+ Employees</option>
              </select>
            </label>

            <label>
              Website
              <div className="company-input-icon">
                <Globe size={16} />
                <input
                  name="website"
                  value={company.website}
                  onChange={updateField}
                  placeholder="www.company.com"
                />
              </div>
            </label>

            <label className="company-full-width">
              Company Description
              <textarea
                name="description"
                value={company.description}
                onChange={updateField}
                rows={3}
                placeholder="Describe your organization"
              />
            </label>
          </div>
        </section>

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
                  name="email"
                  value={company.email}
                  onChange={updateField}
                  required
                />
              </div>
            </label>

            <label>
              Company Phone *
              <div className="company-input-icon">
                <Phone size={16} />
                <input
                  name="phone"
                  value={company.phone}
                  onChange={updateField}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>
            </label>
          </div>
        </section>

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
                required
              />
            </label>

            <label>
              City *
              <input
                name="city"
                value={company.city}
                onChange={updateField}
                required
              />
            </label>

            <label>
              State *
              <input
                name="state"
                value={company.state}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Country *
              <input
                name="country"
                value={company.country}
                onChange={updateField}
                required
              />
            </label>

            <label>
              PIN Code *
              <input
                name="pin"
                value={company.pin}
                onChange={updateField}
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </label>
          </div>
        </section>

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
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="submit" className="company-save-btn">
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanySettings;
