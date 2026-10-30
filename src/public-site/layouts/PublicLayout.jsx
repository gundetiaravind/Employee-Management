
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck, Eye, EyeOff } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import "../styles/public.css";

const DEMO_EMAIL = "manager@orgconnect.com";
const DEMO_PASSWORD = "Manager@123";

export default function PublicLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const openLogin = () => {
      setError("");
      setEmail("");
      setPassword("");
      setLoginOpen(true);
    };

    window.addEventListener("open-platform-manager-login", openLogin);

    return () => {
      window.removeEventListener("open-platform-manager-login", openLogin);
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (
      email.trim().toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      sessionStorage.setItem("platformManagerDemoAuth", "true");
      setLoginOpen(false);
      navigate("/platform-manager/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
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
          onClick={() => setLoginOpen(false)}
        >
          <div
            className="platform-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="platform-modal-close"
              onClick={() => setLoginOpen(false)}
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
              <label htmlFor="platform-email">Email Address</label>

              <input
                id="platform-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="platform-password">Password</label>

              <div className="pm-password-field">
                <input
                  id="platform-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {error && (
                <p className="pm-error" role="alert">
                  {error}
                </p>
              )}
<button
  type="button"
  className="demo-credentials-button"
  onClick={() => {
    setEmail("manager@orgconnect.com");
    setPassword("Manager@123");
    setError("");
  }}
>
  Use Demo Credentials
</button>

<button
  type="submit"
  className="platform-login-submit"
>
  Login
</button>
            </form>

            <p className="pm-security-note">
              Demo Platform Manager access only.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
