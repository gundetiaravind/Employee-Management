import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:8080/api/auth";

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your registered email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "OTP verification failed."
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          email: email.trim().toLowerCase(),
          verificationMessage:
            data.message ||
            "Email verified successfully. Your account is awaiting approval.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter your registered email address.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        `${API_URL}/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to resend OTP."
        );
      }

      setMessage(data.message || "A new OTP has been sent.");
      setOtp("");
    } catch (err) {
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "var(--background, #f5f6fa)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
          borderRadius: "16px",
          background: "var(--card-bg, #ffffff)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ marginBottom: "16px" }}>
            <ShieldCheck size={42} color="#5145e5" />
          </div>

          <h2>Verify your email</h2>

          <p style={{ color: "#777", lineHeight: 1.6 }}>
            Enter the 6-digit verification code sent to your registered
            email address.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <label htmlFor="verificationEmail">Email Address</label>

          <div style={{ display: "flex", gap: "10px", margin: "8px 0 18px" }}>
            <Mail size={20} />

            <input
              id="verificationEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ flex: 1, minWidth: 0, padding: "10px" }}
            />
          </div>

          <label htmlFor="verificationOtp">Verification OTP</label>

          <input
            id="verificationOtp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit OTP"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              margin: "8px 0 18px",
              textAlign: "center",
              letterSpacing: "8px",
              fontSize: "20px",
            }}
          />

          {error && (
            <p role="alert" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={{ color: "#15803d" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: 0,
              borderRadius: "8px",
              background: "#5145e5",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={{
            width: "100%",
            padding: "13px",
            marginTop: "12px",
            background: "transparent",
            border: "1px solid #ddd",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={15} />{" "}
          {resending ? "Sending..." : "Resend OTP"}
        </button>

        <div style={{ textAlign: "center", marginTop: "22px" }}>
          <Link to="/login">
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}