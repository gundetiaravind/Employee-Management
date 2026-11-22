
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck, Eye, EyeOff } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import { saveAuth } from "../../services/authService";
import "../styles/public.css";

const API_URL = "http://localhost:8080/api/auth";

export default function PublicLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const openLogin = () => {
      setError("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoginOpen(true);
    };

    window.addEventListener("open-platform-manager-login", openLogin);

    return () => {
      window.removeEventListener(
        "open-platform-manager-login",
        openLogin
      );
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Invalid email or password."
        );
      }

      if (data.role !== "PLATFORM_MANAGER") {
        throw new Error(
          "Access denied. This account is not a Platform Manager."
        );
      }

      // Use the same authentication storage as the existing login.
      saveAuth(data);

      setLoginOpen(false);
      setEmail("");
      setPassword("");

      navigate("/platform-manager/dashboard");

    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Home />
      <Footer />

      {loginOpen && (
        <div
          className="platform-modal-overlay"
          onClick={() => !loading && setLoginOpen(false)}
        >
          <div
            className="platform-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="platform-modal-close"
              onClick={() => setLoginOpen(false)}
              disabled={loading}
              aria-label="Close login"
            >
              <X size={21} />
            </button>

            <div className="platform-modal-icon">
              <ShieldCheck size={30} />
            </div>

            <h2>Platform Manager Login</h2>

            <p>
              Sign in to manage the OrgConnect platform.
            </p>

            <form onSubmit={handleLogin}>
              <label htmlFor="platform-email">
                Email Address
              </label>

              <input
                id="platform-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <label htmlFor="platform-password">
                Password
              </label>

              <div className="pm-password-field">
                <input
                  id="platform-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />}
                </button>
              </div>

              {error && (
                <p className="pm-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="platform-login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="pm-security-note">
              Secure Platform Manager access.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
