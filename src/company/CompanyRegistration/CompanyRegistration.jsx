
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Upload,
  Globe,
  MapPin,
  Briefcase,
  FileText,
  X,
  Check,
} from "lucide-react";
import "./CompanyRegistration.css";

const API_URL = "http://localhost:8080/api/auth/register";

function InputField({
  label,
  name,
  icon: Icon,
  type = "text",
  placeholder,
  required = false,
  form,
  handleChange,
  disabled = false,
  ...props
}) {
  return (
    <div className="company-field">
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>

      <div className="company-input">
        {Icon && <Icon size={18} />}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={form[name] ?? ""}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          {...props}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  name,
  icon: Icon,
  options,
  required = false,
  form,
  handleChange,
  disabled = false,
}) {
  return (
    <div className="company-field">
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>

      <div className="company-input">
        {Icon && <Icon size={18} />}

        <select
          id={name}
          name={name}
          value={form[name] ?? ""}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function CompanyRegistration() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const [form, setForm] = useState({
    companyName: "",
    companyLogo: null,
    registrationNumber: "",
    companyType: "",
    industry: "",
    companyPhone: "",
    alternatePhone: "",
    website: "",
    country: "India",
    state: "",
    city: "",
    address: "",
    pincode: "",
    ownerName: "",
    ownerEmail: "",
    ownerMobile: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!form.companyLogo) {
      setLogoPreview("");
      return;
    }

    const url = URL.createObjectURL(form.companyLogo);
    setLogoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [form.companyLogo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const mobileFields = [
      "companyPhone",
      "alternatePhone",
      "ownerMobile",
    ];

    if (mobileFields.includes(name) && !/^\d{0,10}$/.test(value)) {
      return;
    }

    if (name === "pincode" && !/^\d{0,6}$/.test(value)) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
    setRegistrationResult(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please upload a PNG, JPG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Company logo must be smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    setForm((prev) => ({ ...prev, companyLogo: file }));
    setError("");
  };

  const removeLogo = () => {
    setForm((prev) => ({ ...prev, companyLogo: null }));

    const input = document.getElementById("companyLogo");

    if (input) {
      input.value = "";
    }
  };

  const validateCompany = () => {
    if (!form.companyName.trim()) {
      return "Enter company name.";
    }

    if (!form.registrationNumber.trim()) {
      return "Enter company registration number.";
    }

    if (!form.companyType) {
      return "Select company type.";
    }

    if (!form.industry) {
      return "Select industry.";
    }

    if (form.companyPhone.length !== 10) {
      return "Company phone number must contain exactly 10 digits.";
    }

    if (form.alternatePhone && form.alternatePhone.length !== 10) {
      return "Alternate contact number must contain exactly 10 digits.";
    }

    if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
      return "Enter a valid website URL beginning with http:// or https://.";
    }

    if (!form.country) {
      return "Select country.";
    }

    if (!form.state.trim()) {
      return "Enter state.";
    }

    if (!form.city.trim()) {
      return "Enter city.";
    }

    if (!form.address.trim()) {
      return "Enter complete company address.";
    }

    if (form.pincode.length !== 6) {
      return "PIN code must contain exactly 6 digits.";
    }

    return "";
  };

  const validateOwner = () => {
    if (!form.ownerName.trim()) {
      return "Enter owner full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
      return "Enter a valid owner email address.";
    }

    if (form.ownerMobile.length !== 10) {
      return "Owner mobile number must contain exactly 10 digits.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (form.password.length > 72) {
      return "Password must not exceed 72 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const validationError = validateCompany();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep(2);
  };

  const handleBack = () => {
    if (isSubmitting) return;

    setStep(1);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const validationError = validateOwner();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setRegistrationResult(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Company information
      formData.append("companyName", form.companyName.trim());
      formData.append(
        "registrationNumber",
        form.registrationNumber.trim()
      );
      formData.append("companyType", form.companyType);
      formData.append("industry", form.industry);
      formData.append("companyPhone", form.companyPhone);
      formData.append("alternatePhone", form.alternatePhone);
      formData.append("companyWebsite", form.website.trim());
      formData.append("country", form.country);
      formData.append("state", form.state.trim());
      formData.append("city", form.city.trim());
      formData.append("pinCode", form.pincode);
      formData.append("companyAddress", form.address.trim());

      // Optional company logo
      if (form.companyLogo) {
        formData.append("companyLogo", form.companyLogo);
      }

      // Owner information
      formData.append("ownerName", form.ownerName.trim());
      formData.append(
        "ownerEmail",
        form.ownerEmail.trim().toLowerCase()
      );
      formData.append("ownerMobileNumber", form.ownerMobile);

      // Login credentials
      formData.append("password", form.password);
      formData.append("confirmPassword", form.confirmPassword);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.message ||
          responseData.detail ||
          responseData.error ||
          `Registration failed. HTTP ${response.status}`
        );
      }

      // Redirect to Owner email verification
      navigate("/verify-email", {
        replace: true,
        state: {
          email:
            responseData.ownerEmail ||
            form.ownerEmail.trim().toLowerCase(),
          accountType: "COMPANY_OWNER",
          message:
            responseData.message ||
            "Company registration submitted. Verify your email to continue.",
        },
      });
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the server. Please check whether your backend is running."
        );
      } else {
        setError(err.message || "Company registration failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = {
    form,
    handleChange,
    disabled: isSubmitting || !!registrationResult,
  };


  return (
    <div className="company-register-page">
      <Link to="/" className="company-back">
        <ArrowLeft size={17} />
        Back to Home
      </Link>

      <div className="company-register-container">
        <div className="company-register-brand">
          <div className="company-brand-icon">
            <Building2 size={28} />
          </div>

          <h1>Register your company</h1>

          <p>
            Create your organization's workspace and register as the
            Company Owner.
          </p>
        </div>

        <div className="company-register-card">
          <div className="company-step-label">
            <span className={step === 1 ? "active" : "completed"}>
              {step === 1 ? "01. COMPANY DETAILS" : "✓ COMPANY DETAILS"}
            </span>

            <span className={step === 2 ? "active" : ""}>
              02. OWNER ACCOUNT
            </span>
          </div>

          <div className="company-progress">
            <div
              className="company-progress-bar"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          <form onSubmit={step === 1 ? handleContinue : handleSubmit}>
            {step === 1 && (
              <>
                <h3 className="company-section-title">
                  <Building2 size={19} />
                  Company Information
                </h3>

                <div className="company-form-grid">
                  <div className="company-field full-width">
                    <InputField
                      label="Company Name"
                      name="companyName"
                      icon={Building2}
                      placeholder="Enter registered company name"
                      required
                      {...fieldProps}
                    />
                  </div>
                </div>

                <div className="company-field company-logo-field">
                  <label htmlFor="companyLogo">
                    Company Logo{" "}
                    <span className="company-optional">(Optional)</span>
                  </label>

                  <div className="company-logo-upload">
                    {logoPreview ? (
                      <div className="company-logo-preview">
                        <img
                          src={logoPreview}
                          alt="Company logo preview"
                        />

                        <button
                          type="button"
                          onClick={removeLogo}
                          aria-label="Remove company logo"
                          disabled={isSubmitting}
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="companyLogo"
                        className="company-logo-label"
                      >
                        <Upload size={21} />
                        <span>Upload logo</span>
                        <small>PNG, JPG or WEBP · Max 2 MB</small>
                      </label>
                    )}

                    <input
                      id="companyLogo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      disabled={isSubmitting}
                      hidden
                    />
                  </div>
                </div>

                <div className="company-form-grid">
                  <InputField
                    label="Registration Number"
                    name="registrationNumber"
                    icon={FileText}
                    placeholder="CIN / LLPIN / Registration No."
                    required
                      {...fieldProps}
                  />

                  <SelectField
                    label="Company Type"
                    name="companyType"
                    icon={Briefcase}
                    required
                    options={[
                      { value: "", label: "Select type" },
                      { value: "Private Limited", label: "Private Limited" },
                      { value: "Public Limited", label: "Public Limited" },
                      { value: "LLP", label: "LLP" },
                      { value: "Partnership", label: "Partnership" },
                      {
                        value: "Sole Proprietorship",
                        label: "Sole Proprietorship",
                      },
                      { value: "Startup", label: "Startup" },
                      { value: "Other", label: "Other" },
                    ]}
                      {...fieldProps}
                  />

                  <SelectField
                    label="Industry"
                    name="industry"
                    icon={Briefcase}
                    required
                    options={[
                      { value: "", label: "Select industry" },
                      {
                        value: "Information Technology",
                        label: "Information Technology",
                      },
                      { value: "Healthcare", label: "Healthcare" },
                      { value: "Education", label: "Education" },
                      { value: "Finance", label: "Finance" },
                      { value: "Manufacturing", label: "Manufacturing" },
                      { value: "Construction", label: "Construction" },
                      { value: "Retail", label: "Retail" },
                      { value: "Real Estate", label: "Real Estate" },
                      { value: "Hospitality", label: "Hospitality" },
                      { value: "Other", label: "Other" },
                    ]}
                      {...fieldProps}
                  />
                </div>

                <h3 className="company-section-title">
                  <Globe size={19} />
                  Contact Details
                </h3>

                <div className="company-form-grid">
                  <InputField
                    label="Company Phone"
                    name="companyPhone"
                    icon={Phone}
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                      {...fieldProps}
                  />

                  <InputField
                    label="Alternate Phone"
                    name="alternatePhone"
                    icon={Phone}
                    type="tel"
                    inputMode="numeric"
                    placeholder="Optional contact number"
                    maxLength={10}
                      {...fieldProps}
                  />

                  <InputField
                    label="Company Website"
                    name="website"
                    icon={Globe}
                    type="url"
                    placeholder="https://www.example.com"
                      {...fieldProps}
                  />
                </div>

                <h3 className="company-section-title">
                  <MapPin size={19} />
                  Company Address
                </h3>

                <div className="company-form-grid">
                  <SelectField
                    label="Country"
                    name="country"
                    icon={MapPin}
                    required
                    options={[
                      { value: "India", label: "India" },
                      { value: "Other", label: "Other" },
                    ]}
                      {...fieldProps}
                  />

                  <InputField
                    label="State"
                    name="state"
                    icon={MapPin}
                    placeholder="Enter state"
                    required
                      {...fieldProps}
                  />

                  <InputField
                    label="City"
                    name="city"
                    icon={MapPin}
                    placeholder="Enter city"
                    required
                      {...fieldProps}
                  />

                  <InputField
                    label="PIN Code"
                    name="pincode"
                    icon={MapPin}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    maxLength={6}
                    required
                      {...fieldProps}
                  />

                  <div className="company-field full-width">
                    <label htmlFor="address">
                      Complete Address *
                    </label>

                    <div className="company-input">
                      <MapPin size={18} />

                      <textarea
                        id="address"
                        name="address"
                        placeholder="Building, street, area and locality"
                        value={form.address}
                        onChange={handleChange}
                        rows={2}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="company-section-title">
                  <User size={19} />
                  Owner Information
                </h3>

                <div className="company-form-grid">
                  <InputField
                    label="Owner Full Name"
                    name="ownerName"
                    icon={User}
                    placeholder="Enter owner's full name"
                    autoComplete="name"
                    required
                      {...fieldProps}
                  />

                  <InputField
                    label="Owner Email Address"
                    name="ownerEmail"
                    icon={Mail}
                    type="email"
                    placeholder="Enter owner's email"
                    autoComplete="email"
                    required
                      {...fieldProps}
                  />

                  <InputField
                    label="Owner Mobile Number"
                    name="ownerMobile"
                    icon={Phone}
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                      {...fieldProps}
                  />
                </div>

                <h3 className="company-section-title">
                  <Lock size={19} />
                  Login Credentials
                </h3>

                <div className="company-form-grid">
                  <div className="company-field">
                    <label htmlFor="ownerPassword">Password *</label>

                    <div className="company-input">
                      <Lock size={18} />

                      <input
                        id="ownerPassword"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        aria-label="Toggle password visibility"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <InputField
                    label="Confirm Password"
                    name="confirmPassword"
                    icon={Lock}
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                      {...fieldProps}
                  />
                </div>

                <div className="company-registration-summary">
                  <Check size={18} />

                  <div>
                    <strong>Company details completed</strong>
                    <p>
                      {form.companyName} · {form.city}, {form.state}
                    </p>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="company-form-message" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="company-form-success" role="status">
                {success}
              </p>
            )}

            <div className="company-step-actions">
              {step === 2 && (
                <button
                  type="button"
                  className="company-previous"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}

              <button
                type="submit"
                className="company-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : step === 1 ? (
                  <>
                    Continue <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Submit Registration <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="company-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
