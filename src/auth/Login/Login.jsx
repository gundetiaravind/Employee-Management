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

const DEMO_USERS = [
  {
    email: "owner@gmail.com",
    password: "Owner@123",
    role: "OWNER",
    dashboard: "/owner/dashboard",
  },
  {
    email: "admin@gmail.com",
    password: "Admin@123",
    role: "ADMIN",
    dashboard: "/admin/dashboard",
  },
  {
    email: "employee@gmail.com",
    password: "Employee@123",
    role: "EMPLOYEE",
    dashboard: "/employee/dashboard",
  },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  // Fill email and password when a demo role is selected.
  const fillDemoCredentials = (user) => {
    setForm({
      email: user.email,
      password: user.password,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    const user = DEMO_USERS.find(
      (account) =>
        account.email === form.email.trim().toLowerCase() &&
        account.password === form.password
    );

    if (!user) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Temporary demo authentication.
    const demoUser = {
      email: user.email,
      role: user.role,
      name:
        user.role === "OWNER"
          ? "Company Owner"
          : user.role === "ADMIN"
            ? "Company Admin"
            : "Employee",
    };

    sessionStorage.setItem(
      "OrgConnect-demo-user",
      JSON.stringify(demoUser)
    );

    navigate(user.dashboard, { replace: true });
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

            <button type="submit" className="auth-submit">
              Sign In
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </div>

          <div className="demo-credentials">
            <h4>Quick Demo Login</h4>

            <p>Choose a role to automatically fill the login details.</p>

            {DEMO_USERS.map((user) => (
              <button
                key={user.role}
                type="button"
                className="demo-login-button"
                onClick={() => fillDemoCredentials(user)}
              >
                <span>
                  {" "}
                  {user.role.charAt(0) +
                    user.role.slice(1).toLowerCase()}{" "}
                  Credentials
                </span>

                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        </div>

        <p className="auth-copyright">
          © {new Date().getFullYear()} OrgConnect
        . All rights reserved.
        </p>
      </div>
    </div>
  );
}