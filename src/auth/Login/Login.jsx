import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import {
  login as loginUser,
  saveAuth,
  getDashboardPath,
} from "../../services/authService";

import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Login using the common authentication service
      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (!data?.accessToken) {
        throw new Error("Authentication token was not received.");
      }

      const role = String(data.role || "")
        .replace(/^ROLE_/, "")
        .toUpperCase();

      const dashboard = getDashboardPath(role);

      if (dashboard === "/login") {
        throw new Error("Your account role is not recognized.");
      }

      const fullName =
        data.fullName ||
        [data.firstName, data.lastName].filter(Boolean).join(" ") ||
        data.username ||
        "";

      const authenticatedUser = {
        ...data,
        accessToken: data.accessToken,
        tokenType: data.tokenType || "Bearer",
        userId: data.userId,
        companyId: data.companyId ?? null,
        fullName,
        email: data.email || form.email.trim().toLowerCase(),
        role,
      };

      if (
        (role === "COMPANY_OWNER" || role === "OWNER") &&
        !authenticatedUser.companyId
      ) {
        throw new Error(
          "Company ID was not received from the backend. Please check your login response.",
        );
      }

      // Save complete authentication data
      saveAuth(authenticatedUser);

      // Redirect according to user role
      navigate(dashboard, { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-back">
        <Link to="/">
          <ArrowLeft size={17} />
          Back to Home
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Users size={27} />
          </div>

          <h2>
            Org<span>Connect</span>
          </h2>

          <p>Employee Management System</p>
        </div>

        <div className="auth-card">
          <div className="auth-heading">
            <h1>Welcome back!</h1>
            <p>Sign in to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>

            <div className="auth-input">
              <Mail size={19} />

              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="login-password">Password</label>

            <div className="auth-input">
              <Lock size={19} />

              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-button">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="auth-message" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create account</Link>
          </div>
        </div>

        <p className="auth-copyright">
          © {new Date().getFullYear()} OrgConnect. All rights reserved.
        </p>
      </div>
    </div>
  );
}
