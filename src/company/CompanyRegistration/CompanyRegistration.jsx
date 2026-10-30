
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft
} from "lucide-react";
import "./CompanyRegistration.css";

export default function CompanyRegistration() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    businessEmail: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.mobile.length !== 10) {
      setError("Mobile number must contain exactly 10 digits.");
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

    setError(
      "Company registration form validated. Company creation will be connected to the backend."
    );
  };

  return (
    <div className="company-register-page">
      <Link to="/" className="company-back">
        <ArrowLeft size={17} /> Back to Home
      </Link>

      <div className="company-register-container">
        <div className="company-register-brand">
          <div className="company-brand-icon">
            <Building2 size={28} />
          </div>
          <h1>Create your company</h1>
          <p>Set up your organization's employee management workspace.</p>
        </div>

        <div className="company-register-card">
          <div className="company-step-label">
            <span>COMPANY SETUP</span>
            <span>OWNER ACCOUNT</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="companyName">Company Name</label>
            <div className="company-input">
              <Building2 size={19} />
              <input
                id="companyName"
                name="companyName"
                placeholder="Enter registered company name"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="ownerName">Owner Full Name</label>
            <div className="company-input">
              <User size={19} />
              <input
                id="ownerName"
                name="ownerName"
                placeholder="Enter owner full name"
                value={form.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="businessEmail">Business Email</label>
            <div className="company-input">
              <Mail size={19} />
              <input
                id="businessEmail"
                name="businessEmail"
                type="email"
                placeholder="Enter business email"
                value={form.businessEmail}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="mobile">Mobile Number</label>
            <div className="company-input">
              <Phone size={19} />
              <input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="ownerPassword">Password</label>
            <div className="company-input">
              <Lock size={19} />
              <input
                id="ownerPassword"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password (minimum 8 characters)"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="company-input">
              <Lock size={19} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="company-form-message">{error}</p>}

            <button type="submit" className="company-submit">
              Create Company Account <ArrowRight size={18} />
            </button>
          </form>

          <p className="company-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
