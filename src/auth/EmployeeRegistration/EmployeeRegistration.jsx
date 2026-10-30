import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import "./EmployeeRegistration.css";

function EmployeeRegistration() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    companyCode: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!/^[A-Za-z0-9]{6,12}$/.test(form.companyCode.trim())) {
      setError("Enter a valid company code (6–12 letters or digits).");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
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

    setMessage(
      "Your details are valid. Company verification and account creation will be connected to the backend."
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
          <ArrowLeft size={17} /> Back
        </button>

        <div className="employee-registration-heading">
          <div className="employee-registration-icon">
            <UserPlus size={26} />
          </div>
          <h1>Join Your Company</h1>
          <p>Enter your company code and personal details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="employee-registration-field">
            <label htmlFor="companyCode">Company Code *</label>
            <input
              id="companyCode"
              name="companyCode"
              value={form.companyCode}
              onChange={handleChange}
              placeholder="Enter company code"
              required
            />
          </div>

          <div className="employee-registration-field">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="employee-registration-field">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="employee-registration-field">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={(event) =>
                handleChange({
                  target: {
                    name: "mobile",
                    value: event.target.value.replace(/\D/g, "").slice(0, 10),
                  },
                })
              }
              placeholder="10-digit mobile number"
              required
            />
          </div>

          <div className="employee-registration-field">
            <label htmlFor="password">Password *</label>
            <div className="employee-registration-password">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="employee-registration-field">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className="employee-registration-password">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="employee-registration-error">{error}</p>}
          {message && <p className="employee-registration-success">{message}</p>}

          <button type="submit" className="employee-registration-submit">
            Continue Registration
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