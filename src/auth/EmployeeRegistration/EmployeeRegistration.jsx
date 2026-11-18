import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  UserPlus,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Briefcase,
} from "lucide-react";

import invitationService from "../../services/invitationService";

import "./EmployeeRegistration.css";

function EmployeeRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [invitation, setInvitation] = useState(null);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    employmentType: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==================== VALIDATE INVITATION ====================

  useEffect(() => {
    let active = true;

    const validate = async () => {
      if (!token) {
        setError(
          "Invitation token is missing. Please use your email invitation link.",
        );
        setLoading(false);
        return;
      }

      try {
        const response = await invitationService.validateInvitation(token);

        if (!active) return;

        if (!response.valid) {
          throw new Error(response.message || "Invalid invitation.");
        }

        setInvitation(response);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to validate invitation. Please request a new invitation.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    validate();

    return () => {
      active = false;
    };
  }, [token]);

  // ==================== HANDLE FORM CHANGES ====================

  const handleChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "alternatePhone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 20);
    }

    if (name === "postalCode") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    setError("");
    setMessage("");
  };

  // ==================== PASSWORD STRENGTH ====================

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) {
      return { score: 0, label: "", className: "" };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score: 1, label: "Weak", className: "weak" };
    }

    if (score <= 3) {
      return { score: 2, label: "Medium", className: "medium" };
    }

    return { score: 3, label: "Strong", className: "strong" };
  };

  const passwordStrength = getPasswordStrength();

  // ==================== SUBMIT REGISTRATION ====================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!invitation || !token) {
      setError("Your invitation is not valid.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const invitedRole = String(invitation.invitedRole || "")
      .replace(/^ROLE_/, "")
      .toUpperCase();

    if (!["ADMIN", "EMPLOYEE"].includes(invitedRole)) {
      setError("Invalid invitation role.");
      return;
    }

    // Employee profile fields are required only for Employees.
    if (invitedRole === "EMPLOYEE") {
      if (!form.address.trim()) {
        setError("Please enter your address.");
        return;
      }

      if (!form.city.trim()) {
        setError("Please enter your city.");
        return;
      }

      if (!form.state.trim()) {
        setError("Please enter your state.");
        return;
      }

      if (!/^[0-9]{6}$/.test(form.postalCode)) {
        setError("Please enter a valid 6-digit PIN code.");
        return;
      }
    }

    const registrationData = {
      token,
      password: form.password,
      confirmPassword: form.confirmPassword,
      alternatePhone: form.alternatePhone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      employmentType: form.employmentType || null,
    };

    try {
      setSubmitting(true);

      await invitationService.acceptInvitation(registrationData);

      setMessage(
        `${invitedRole === "ADMIN" ? "Admin" : "Employee"} registration completed successfully.`,
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: invitation.email,
            message: "Registration successful. Please log in.",
          },
        });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className="employee-registration-page">
        <div className="employee-registration-card">
          <p>Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // ==================== INVALID INVITATION ====================

  if (!invitation) {
    return (
      <div className="employee-registration-page">
        <div className="employee-registration-card">
          <button
            type="button"
            className="employee-registration-back"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={17} />
            Back to Login
          </button>

          <h2>Invitation Unavailable</h2>

          <p className="employee-registration-error" role="alert">
            {error || "This invitation is invalid or has expired."}
          </p>

          <button
            type="button"
            className="employee-registration-submit"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const invitedRole = String(invitation.invitedRole || "")
    .replace(/^ROLE_/, "")
    .toUpperCase();

  const isEmployee = invitedRole === "EMPLOYEE";

  // ==================== REGISTRATION PAGE ====================

  return (
    <div className="employee-registration-page">
      <div className="employee-registration-card">
        <button
          type="button"
          className="employee-registration-back"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft size={17} />
          Back to Login
        </button>

        {/* HEADER */}

        <div className="employee-registration-heading">
          <div className="employee-registration-icon">
            <UserPlus size={26} />
          </div>

          <h1>Complete Your Registration</h1>

          <p>
            You've been invited to join your company. Complete the details below
            to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* INVITATION INFORMATION */}

          <div className="employee-registration-section">
            <h3>
              <Building2 size={18} />
              Invitation Information
            </h3>

            <div className="employee-registration-grid">
              <div className="employee-registration-field">
                <label>Company</label>

                <div className="employee-registration-input">
                  <Building2 size={18} />

                  <input value={invitation.companyName || ""} readOnly />
                </div>
              </div>

              <div className="employee-registration-field">
                <label>Invited Role</label>

                <div className="employee-registration-input">
                  <ShieldCheck size={18} />

                  <input value={isEmployee ? "Employee" : "Admin"} readOnly />
                </div>
              </div>

              <div className="employee-registration-field">
                <label>Full Name</label>

                <div className="employee-registration-input">
                  <User size={18} />

                  <input value={invitation.employeeName || ""} readOnly />
                </div>
              </div>

              <div className="employee-registration-field">
                <label>Email Address</label>

                <div className="employee-registration-input">
                  <Mail size={18} />

                  <input type="email" value={invitation.email || ""} readOnly />
                </div>
              </div>

              {isEmployee && invitation.employmentCode && (
                <div className="employee-registration-field full-width">
                  <label>Employment Code</label>

                  <div className="employee-registration-input">
                    <Briefcase size={18} />

                    <input value={invitation.employmentCode} readOnly />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* EMPLOYEE PROFILE INFORMATION */}

          {isEmployee && (
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
                  <label htmlFor="postalCode">PIN Code *</label>

                  <div className="employee-registration-input">
                    <MapPin size={18} />

                    <input
                      id="postalCode"
                      name="postalCode"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      required
                    />
                  </div>
                </div>

                <div className="employee-registration-field">
                  <label htmlFor="alternatePhone">Alternate Phone</label>

                  <div className="employee-registration-input">
                    <User size={18} />

                    <input
                      id="alternatePhone"
                      name="alternatePhone"
                      value={form.alternatePhone}
                      onChange={handleChange}
                      placeholder="Alternate phone number"
                    />
                  </div>
                </div>

                <div className="employee-registration-field full-width">
                  <label htmlFor="employmentType">Employment Type</label>

                  <div className="employee-registration-input">
                    <Briefcase size={18} />

                    <select
                      id="employmentType"
                      name="employmentType"
                      value={form.employmentType}
                      onChange={handleChange}
                    >
                      <option value="">Select employment type</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOGIN CREDENTIALS */}

          <div className="employee-registration-section">
            <h3>
              <ShieldCheck size={18} />
              Create Login Credentials
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
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {form.password && (
                  <div
                    className={`employee-password-strength ${passwordStrength.className}`}
                  >
                    <div className="employee-password-strength-bars">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={
                            level <= passwordStrength.score ? "filled" : ""
                          }
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
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
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
              Your account will be created with the role assigned in your
              invitation. You cannot change your assigned role during
              registration.
            </p>
          </div>

          {/* ERRORS */}

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

          {/* SUBMIT */}

          <button
            type="submit"
            className="employee-registration-submit"
            disabled={submitting}
          >
            {submitting ? "Creating Account..." : "Complete Registration"}

            {!submitting && <ArrowRight size={18} />}
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
