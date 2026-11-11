
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
import "./Login.css";

const API_URL = "http://localhost:8080/api/auth/login";
export const AUTH_KEY = "orgconnect-auth";

const ROLE_ROUTES = {
  PLATFORM_MANAGER: "/platform-manager/dashboard",
  SUPER_ADMIN: "/platform-manager/dashboard",
  COMPANY_OWNER: "/owner/dashboard",
  OWNER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
  EMPLOYEE: "/employee/dashboard",
};

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

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Invalid email or password."
        );
      }

      if (!data.accessToken) {
        throw new Error("Authentication token was not received.");
      }

      const role = String(data.role || "").replace(/^ROLE_/, "");

      const dashboard = ROLE_ROUTES[role];

      if (!dashboard) {
        throw new Error("Your account role is not recognized.");
      }
    
      const authenticatedUser = {
        accessToken: data.accessToken,
        tokenType: data.tokenType || "Bearer",
        
        userId: data.id,
        companyId : data.companyId,
        fullName: data.fullName,
        email: data.email,
        role,
      };
      //console.log(data);

      sessionStorage.setItem(
        AUTH_KEY,
        JSON.stringify(authenticatedUser)
      );

      navigate(dashboard, { replace: true });

    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
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
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            <div className="auth-options">
              <label className="remember-option">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  setError("Password recovery will be added later.")
                }
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="auth-message" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </div>
        </div>

        <p className="auth-copyright">
          © {new Date().getFullYear()} OrgConnect.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}
