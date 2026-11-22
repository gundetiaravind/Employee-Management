import { useNavigate } from "react-router-dom";
import { Building2, Users, ArrowRight, BriefcaseBusiness } from "lucide-react";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register-selection-page">
      <div className="register-selection-card">
        <button
          className="register-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <div className="register-heading">
          <div className="register-brand-icon">
            <BriefcaseBusiness size={26} />
          </div>

          <h1>Join OrgConnect</h1>
          <p>Choose how you want to get started.</p>
        </div>

        <div className="register-options">
          <button
            className="register-option"
            onClick={() => navigate("/register/company")}
          >
            <div className="register-option-icon">
              <Building2 size={28} />
            </div>

            <div className="register-option-content">
              <h2>Create a Company</h2>
              <p>
                Register your company and become its owner.
                You can manage admins and employees.
              </p>
              <span>Register your company</span>
            </div>

            <ArrowRight className="register-option-arrow" size={22} />
          </button>

          <button
            className="register-option"
            onClick={() => navigate("/register/employee")}
          >
            <div className="register-option-icon">
              <Users size={28} />
            </div>

            <div className="register-option-content">
              <h2>Join as Existing Admin/Employee </h2>
              <p>
                Join your company using the company code or
                invitation provided by your company.
              </p>
              <span>Join a company</span>
            </div>

            <ArrowRight className="register-option-arrow" size={22} />
          </button>
        </div>

        <div className="register-login-link">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Register;