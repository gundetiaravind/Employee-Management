import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

import authService from "../services/authService";
import "./ForgotPassword.css";

const OTP_TIMER_SECONDS = 60;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
    password
  );

const getResponseMessage = (response, fallback) => {
  const data = response?.data ?? response;
  if (typeof data === "string") return data;
  return data?.message || data?.detail || data?.error || fallback;
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return (
    data?.message ||
    data?.detail ||
    data?.error ||
    err?.message ||
    fallback
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  // STEP 1 = Email, STEP 2 = OTP verification, STEP 3 = New password
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    if (otpTimer <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setOtpTimer((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [otpTimer]);

  const formatOtpTimer = () => {
    const minutes = Math.floor(otpTimer / 60);
    const seconds = otpTimer % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: "" }));
    setError("");
    setSuccessMessage("");
  };

  const validateField = (key, value) => {
    if (key === "email") {
      if (!value.trim()) return "Please enter your email.";
      if (!isValidEmail(value)) return "Please enter a valid email address.";
    }

    if (key === "password") {
      if (!value.trim()) return "Please enter a new password.";
      if (value.length > 72 || !isValidPassword(value)) {
        return "Password must contain at least 8 characters, uppercase, lowercase, number and special character.";
      }
    }

    if (key === "confirmPassword") {
      if (!value.trim()) return "Please confirm your password.";
      if (value !== form.password) return "Passwords do not match.";
    }

    return "";
  };

  const handleBlur = (key) => {
    const message = validateField(key, form[key]);
    setFieldErrors((previous) => ({ ...previous, [key]: message }));
  };

  const validateEmail = () => {
    const message = validateField("email", form.email);
    setFieldErrors((previous) => ({ ...previous, email: message }));
    return !message;
  };

  const forgotPassword = async () => {
    setError("");
    setSuccessMessage("");
    setOtpError("");

    if (!validateEmail()) return;
    if (step === 2 && otpTimer > 0) return;

    setLoading(true);

    try {
      const response = await authService.forgotPassword(
        form.email.trim().toLowerCase(),
        "User"
      );

      setOtp("");
      setOtpVerified(false);
      setOtpTimer(OTP_TIMER_SECONDS);
      setSuccessMessage(
        getResponseMessage(response, "OTP has been sent to your email address.")
      );
      setStep(2);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  // const passwordVerifyOtp = async () => {
  //   setOtpError("");
  //   setError("");
  //   setSuccessMessage("");

  //   if (!otp.trim()) {
  //     setOtpError("Please enter the OTP.");
  //     return;
  //   }

  //   if (!/^\d{6}$/.test(otp.trim())) {
  //     setOtpError("Please enter a valid 6-digit OTP.");
  //     return;
  //   }

  //   if (otpTimer <= 0) {
  //     setOtpError("OTP has expired. Please request a new OTP.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await authService.passwordVerifyOtp(
  //       form.email.trim().toLowerCase(),
  //       otp.trim()
  //     );

  //     setOtpVerified(true);
  //     setOtpTimer(0);
  //     setSuccessMessage(
  //       getResponseMessage(response, "OTP verified successfully.")
  //     );
  //     setStep(3);
  //   } catch (err) {
  //     setOtpError(getErrorMessage(err, "Invalid OTP. Please try again."));
  //     setOtpVerified(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const passwordVerifyOtp = async () => {
  setOtpError("");
  setError("");
  setSuccessMessage("");

  if (!otp.trim()) {
    setOtpError("Please enter the OTP.");
    return;
  }

  if (!/^\d{6}$/.test(otp.trim())) {
    setOtpError("Please enter a valid 6-digit OTP.");
    return;
  }

  if (otpTimer <= 0) {
    setOtpError("OTP has expired. Please request a new OTP.");
    return;
  }

  setLoading(true);

  try {
    const response = await authService.passwordVerifyOtp(
      form.email.trim().toLowerCase(),
      otp.trim()
    );

    const token = response?.resetToken;

    if (!token) {
      throw new Error("Reset token was not received from the server.");
    }

    setResetToken(token);
    setOtpVerified(true);
    setOtpTimer(0);

    setSuccessMessage("OTP verified successfully.");
    setStep(3);

  } catch (err) {
    setOtpError(getErrorMessage(err, "Invalid OTP. Please try again."));
    setOtpVerified(false);
    setResetToken("");
  } finally {
    setLoading(false);
  }
};
  const validatePasswordStep = () => {
    const errors = {};
    const passwordError = validateField("password", form.password);
    const confirmPasswordError = validateField(
      "confirmPassword",
      form.confirmPassword
    );

    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isPasswordStepValid = () =>
    otpVerified &&
    isValidPassword(form.password) &&
    form.confirmPassword.trim().length > 0 &&
    form.password === form.confirmPassword;

  const resetPassword = async () => {
    setError("");
    setSuccessMessage("");

    if (!otpVerified) {
      setError("Please verify the OTP before resetting your password.");
      return;
    }

    if (!validatePasswordStep()) return;

    setLoading(true);

    try {
      
      const response = await authService.resetPassword(
          form.email.trim().toLowerCase(),
          form.password,
          resetToken
      );

      setSuccessMessage(
        getResponseMessage(response, "Password reset successfully.")
      );

      setForm((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));
      setOtpVerified(false);

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            passwordReset: true,
            email: form.email.trim().toLowerCase(),
          },
        });
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset password."));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (loading) return;

    setError("");
    setSuccessMessage("");
    setOtpError("");

    if (step === 2) {
      setStep(1);
      setOtp("");
      setOtpVerified(false);
      setOtpTimer(0);
    } else if (step === 3) {
      setStep(2);
      setOtpVerified(false);
      setOtp("");
      setOtpTimer(0);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return "Enter your email";
    if (step === 2) return "Verify your email";
    return "Create new password";
  };

  const StepIndicator = () => (
    <div className="fp-steps" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((number) => (
        <div className="fp-step-group" key={number}>
          <div
            className={`fp-step ${
              step >= number ? "fp-step-active" : ""
            } ${step > number ? "fp-step-complete" : ""}`}
          >
            {step > number ? <CheckCircle size={19} /> : number}
          </div>
          {number < 3 && (
            <div
              className={`fp-step-line ${
                step > number ? "fp-step-line-active" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <main className="fp-page">
      <div className="fp-background" aria-hidden="true" />

      <section className="fp-card">
        <div className="fp-banner">
          <img
            src="/images/login_reg.png"
            alt="OrgConnect"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="fp-banner-fallback">OrgConnect</div>
        </div>

        <div className="fp-content">
          <header className="fp-heading">
            <div className="fp-heading-icon">
              <LockKeyhole size={25} />
            </div>
            <h1>Forgot Password?</h1>
            <p>{getStepTitle()}</p>
          </header>

          <StepIndicator />

          {error && (
            <div className="fp-alert fp-alert-error" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="fp-alert fp-alert-success" role="status">
              <CheckCircle size={19} />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 && (
            <div className="fp-form">
              <div className="fp-field">
                <label htmlFor="fp-email">Email ID *</label>
                <div className="fp-input-wrap">
                  <Mail className="fp-input-icon" size={17} />
                  <input
                    id="fp-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`fp-input fp-input-with-icon ${
                      fieldErrors.email ? "fp-input-error" : ""
                    }`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="fp-field-error">{fieldErrors.email}</p>
                )}
              </div>

              <div className="fp-info">
                Enter the email address associated with your account. We will
                send a 6-digit OTP to verify your identity.
              </div>

              <button
                type="button"
                className="fp-button fp-button-primary"
                onClick={forgotPassword}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
                {!loading && <ArrowRight size={17} />}
              </button>

              <p className="fp-small-link">
                Remember your password? <Link to="/login">Login</Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="fp-form">
              <div className="fp-otp-header">
                <div className="fp-otp-icon">
                  <ShieldCheck size={32} />
                </div>
                <h2>Verify your email</h2>
                <p>We have sent an OTP to</p>
                <strong>{form.email}</strong>
              </div>

              <div className="fp-field">
                <label htmlFor="fp-otp">Enter OTP *</label>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, ""));
                    setOtpError("");
                    setError("");
                  }}
                  className={`fp-input fp-otp-input ${
                    otpError ? "fp-input-error" : ""
                  }`}
                  placeholder="••••••"
                  autoComplete="one-time-code"
                  disabled={loading}
                />
                {otpError && (
                  <p className="fp-field-error fp-centered">{otpError}</p>
                )}
              </div>

              <p className="fp-timer">
                {otpTimer > 0 ? (
                  <>
                    You can resend OTP in <strong>{formatOtpTimer()}</strong>
                  </>
                ) : (
                  "OTP expired or not received? Request a new OTP."
                )}
              </p>

              <button
                type="button"
                className="fp-button fp-button-primary"
                onClick={passwordVerifyOtp}
                disabled={loading || otp.length !== 6 || otpTimer <= 0}
              >
                {loading ? "Verifying..." : "Verify OTP"}
                {!loading && <CheckCircle size={17} />}
              </button>

              <button
                type="button"
                className="fp-button fp-button-secondary"
                onClick={goBack}
                disabled={loading}
              >
                <ArrowLeft size={17} /> Back
              </button>

              <div className="fp-resend">
                <button
                  type="button"
                  onClick={forgotPassword}
                  disabled={loading || otpTimer > 0}
                >
                  {loading
                    ? "Sending OTP..."
                    : otpTimer > 0
                    ? `Resend OTP in ${formatOtpTimer()}`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fp-form fp-password-form">
              <div className="fp-verified">
                <CheckCircle size={20} />
                <div>
                  <span>Email verified</span>
                  <strong>{form.email}</strong>
                </div>
              </div>

              <div className="fp-field">
                <label htmlFor="fp-password">New Password *</label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`fp-input fp-input-with-action ${
                      fieldErrors.password ? "fp-input-error" : ""
                    }`}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="fp-password-toggle"
                    onClick={() => setShowPass((previous) => !previous)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="fp-field-error">{fieldErrors.password}</p>
                )}

                <div className="fp-password-rules">
                  <p className={form.password.length >= 8 ? "valid" : ""}>
                    ✓ At least 8 characters
                  </p>
                  <p className={/[A-Z]/.test(form.password) ? "valid" : ""}>
                    ✓ One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(form.password) ? "valid" : ""}>
                    ✓ One lowercase letter
                  </p>
                  <p className={/\d/.test(form.password) ? "valid" : ""}>
                    ✓ One number
                  </p>
                  <p
                    className={
                      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                        form.password
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One special character
                  </p>
                </div>
              </div>

              <div className="fp-field">
                <label htmlFor="fp-confirm-password">Confirm Password *</label>
                <div className="fp-input-wrap">
                  <input
                    id="fp-confirm-password"
                    type={showConfirmPass ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      update("confirmPassword", event.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`fp-input fp-input-with-action ${
                      fieldErrors.confirmPassword ? "fp-input-error" : ""
                    }`}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="fp-password-toggle"
                    onClick={() =>
                      setShowConfirmPass((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPass
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPass ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="fp-field-error">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
                {form.confirmPassword &&
                  form.password === form.confirmPassword &&
                  isValidPassword(form.password) && (
                    <p className="fp-match">
                      <CheckCircle size={14} /> Passwords match
                    </p>
                  )}
              </div>

              <button
                type="button"
                className="fp-button fp-button-primary fp-reset-button"
                onClick={resetPassword}
                disabled={loading || !isPasswordStepValid()}
              >
                <LockKeyhole size={17} />
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <button
                type="button"
                className="fp-button fp-button-secondary"
                onClick={goBack}
                disabled={loading}
              >
                <ArrowLeft size={17} /> Back
              </button>
            </div>
          )}

          <p className="fp-register-link">
            New Account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}