import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Briefcase,
  Globe,
} from "lucide-react";
import "./EmployeeRegistration.css";

function EmployeeRegistration() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    companyCode: "",
    accountType: "EMPLOYEE",
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    let updatedValue = value;

    if (name === "companyCode") {
      updatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    }

    if (name === "mobile") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pinCode") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    setError("");
    setMessage("");
  };

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) return { score: 0, label: "", className: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: "Weak", className: "weak" };
    if (score <= 3) return { score: 2, label: "Medium", className: "medium" };

    return { score: 3, label: "Strong", className: "strong" };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^[A-Z0-9]{6,12}$/.test(form.companyCode)) {
      setError("Enter a valid company code containing 6–12 letters or digits.");
      return;
    }

    if (!["EMPLOYEE", "ADMIN"].includes(form.accountType)) {
      setError("Please select a valid account type.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setError("Mobile number must contain exactly 10 digits.");
      return;
    }

    if (!form.address.trim()) {
      setError("Enter your complete address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Enter your state.");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pinCode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    if (!form.country.trim()) {
      setError("Select your country.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    setMessage(
      form.accountType === "ADMIN"
        ? "Your Admin registration request is valid. Company verification and Owner approval are required before Admin access is granted."
        : "Your Employee registration details are valid. Company verification and account creation need to be connected to the backend."
    );
  };

  return (
    <div className="employee-registration-page">
      <div className="employee-registration-card">

        <button
          type="button"
          className="employee-registration-back"
          onClick={() => navigate("/register")}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="employee-registration-heading">
          <div className="employee-registration-icon">
            <UserPlus size={26} />
          </div>

          <h1>Join Your Company</h1>

          <p>
            Register as an Admin or Employee using your company code.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* COMPANY AND ACCOUNT TYPE */}

          <div className="employee-registration-section">
            <h3>
              <Building2 size={18} />
              Company Information
            </h3>

            <div className="employee-registration-grid">

              <div className="employee-registration-field">
                <label htmlFor="companyCode">Company Code *</label>

                <div className="employee-registration-input">
                  <Building2 size={18} />
                  <input
                    id="companyCode"
                    name="companyCode"
                    value={form.companyCode}
                    onChange={handleChange}
                    placeholder="Enter company code"
                    maxLength={12}
                    autoComplete="off"
                    required
                  />
                </div>

                <small className="employee-registration-hint">
                  Enter the 6–12 character code provided by your company.
                </small>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="accountType">Register As *</label>

                <div className="employee-registration-input">
                  <ShieldCheck size={18} />

                  <select
                    id="accountType"
                    name="accountType"
                    value={form.accountType}
                    onChange={handleChange}
                    required
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <small className="employee-registration-hint">
                  Admin access requires approval from the company Owner.
                </small>
              </div>

            </div>
          </div>

          {/* PERSONAL INFORMATION */}

          <div className="employee-registration-section">
            <h3>
              <User size={18} />
              Personal Information
            </h3>

            <div className="employee-registration-grid">

              <div className="employee-registration-field">
                <label htmlFor="fullName">Full Name *</label>

                <div className="employee-registration-input">
                  <User size={18} />
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="email">Email Address *</label>

                <div className="employee-registration-input">
                  <Mail size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field full-width">
                <label htmlFor="mobile">Mobile Number *</label>

                <div className="employee-registration-input">
                  <Phone size={18} />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel-national"
                    required
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ADDRESS */}

          <div className="employee-registration-section">
            <h3>
              <MapPin size={18} />
              Address Information
            </h3>

            <div className="employee-registration-grid">

              <div className="employee-registration-field full-width">
                <label htmlFor="address">Street Address *</label>

                <div className="employee-registration-input employee-registration-textarea">
                  <MapPin size={18} />

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, area, landmark"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="city">City *</label>

                <div className="employee-registration-input">
                  <MapPin size={18} />
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="state">State *</label>

                <div className="employee-registration-input">
                  <MapPin size={18} />
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="pinCode">PIN Code *</label>

                <div className="employee-registration-input">
                  <MapPin size={18} />
                  <input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    required
                  />
                </div>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="country">Country *</label>

                <div className="employee-registration-input">
                  <Globe size={18} />

                  <select
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

            </div>
          </div>


          {/* LOGIN CREDENTIALS */}

          <div className="employee-registration-section">
            <h3>
              <ShieldCheck size={18} />
              Login Credentials
            </h3>

            <div className="employee-registration-grid">

              <div className="employee-registration-field">
                <label htmlFor="password">Password *</label>

                <div className="employee-registration-input employee-registration-password">
                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {form.password && (
                  <div className={`employee-password-strength ${passwordStrength.className}`}>
                    <div className="employee-password-strength-bars">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={level <= passwordStrength.score ? "filled" : ""}
                        />
                      ))}
                    </div>
                    <small>Password strength: {passwordStrength.label}</small>
                  </div>
                )}

                <small className="employee-registration-hint">
                  Use at least 8 characters.
                </small>
              </div>

              <div className="employee-registration-field">
                <label htmlFor="confirmPassword">Confirm Password *</label>

                <div className="employee-registration-input employee-registration-password">
                  <Lock size={18} />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {form.confirmPassword && (
                  <small
                    className={
                      form.password === form.confirmPassword
                        ? "employee-password-match"
                        : "employee-password-mismatch"
                    }
                  >
                    {form.password === form.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </small>
                )}
              </div>

            </div>
          </div>

          {/* INFORMATION NOTE */}

          <div className="employee-registration-note">
            <CheckCircle2 size={18} />

            <p>
              {form.accountType === "ADMIN"
                ? "Your Admin access request will need approval from your company's Owner. Selecting Admin does not automatically grant administrative permissions."
                : "Make sure your company code and personal details are correct before continuing."}
            </p>
          </div>

          {error && (
            <p className="employee-registration-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="employee-registration-success" role="status">
              {message}
            </p>
          )}

          <button type="submit" className="employee-registration-submit">
            Continue Registration
            <ArrowRight size={18} />
          </button>

        </form>

        <p className="employee-registration-login">
          Already registered?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default EmployeeRegistration;