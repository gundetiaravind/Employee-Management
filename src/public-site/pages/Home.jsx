
import {
  Users,
  CalendarCheck,
  Wallet,
  FileBarChart,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Building2,
  Activity,
  BarChart3,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Manage employee profiles, personal details, departments and work information.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance Tracking",
    description:
      "Track daily attendance, working hours, check-in and check-out records.",
  },
  {
    icon: ClipboardList,
    title: "Leave Management",
    description:
      "Submit leave requests, review applications and monitor leave balances.",
  },
  {
    icon: Wallet,
    title: "Payroll Management",
    description:
      "Organize salary details, payroll records and employee payslips.",
  },
  {
    icon: FileBarChart,
    title: "Reports & Analytics",
    description:
      "View workforce information and generate useful management reports.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Provide separate workspaces for owners, administrators and employees.",
  },
];

export default function Home() {
  const navigate = useNavigate();


  return (
    <main>
      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="status-dot" />
              SMART WORKFORCE MANAGEMENT
            </span>

            <h1>
              Manage your people.
              <span> Empower your business.</span>
            </h1>

            <p>
              A centralized employee management platform to organize
              your workforce, simplify daily operations and improve
              workplace productivity.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started <ArrowRight size={18} />
              </Link>

              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>

            <div className="hero-points">
              <span>
                <CheckCircle2 size={17} /> Organized workforce
              </span>
              <span>
                <CheckCircle2 size={17} /> Role-based access
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-top">
                <div>
                  <span className="visual-label">WORKFORCE OVERVIEW</span>
                  <h3>Employee Workspace</h3>
                </div>
                <div className="visual-icon">
                  <Users size={23} />
                </div>
              </div>

              <div className="visual-stat">
                <span>Total employees</span>
                <strong>Employee records</strong>
                <small>Organized in one place</small>
              </div>

              <div className="visual-grid">
                <div className="mini-stat">
                  <CalendarCheck />
                  <strong>Attendance</strong>
                  <span>Daily tracking</span>
                </div>

                <div className="mini-stat">
                  <Wallet />
                  <strong>Payroll</strong>
                  <span>Salary records</span>
                </div>

                <div className="mini-stat">
                  <ClipboardList />
                  <strong>Leave</strong>
                  <span>Request management</span>
                </div>

                <div className="mini-stat">
                  <FileBarChart />
                  <strong>Reports</strong>
                  <span>Workforce insights</span>
                </div>
              </div>
            </div>

            <div className="floating-note">
              <ShieldCheck size={20} />
              <span>One platform. Three workspaces.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section section-padding">
        <div className="section-container about-grid">
          <div>
            <span className="section-label">ABOUT THE PLATFORM</span>
            <h2>Everything your workforce needs, in one place.</h2>
          </div>

          <div>
            <p>
              OrgConnect is designed to simplify employee administration.
              It brings employee records, attendance, leave, payroll and
              reporting into one organized platform.
            </p>

            <p>
              Each user gets a dedicated workspace based on their role,
              helping teams work independently while staying connected.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section section-padding">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">PLATFORM FEATURES</span>
            <h2>Powerful tools for better management.</h2>
            <p>
              Everything you need to manage everyday employee operations.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM MANAGER SECTION */}
      <section
        id="platform-manager"
        className="platform-manager-section section-padding"
      >
        <div className="section-container">
          <div className="platform-manager-card">
            <div className="platform-manager-content">
              <span className="section-label">
                PLATFORM MANAGEMENT
              </span>

              <h2>Manage the entire OrgConnect platform.</h2>

              <p>
                A centralized platform management workspace to oversee
                registered companies, monitor their activity, track
                company status and view overall platform statistics.
              </p>

              <button
  type="button"
  className="primary-button"
  onClick={() =>
    window.dispatchEvent(new Event("open-platform-manager-login"))
  }
>
  Platform Manager Login
  <ArrowRight size={18} />
</button>
            </div>

            <div className="platform-manager-visual">
              <div className="platform-manager-icon">
                <Building2 size={34} />
              </div>

              <h3>Platform Overview</h3>

              <div className="platform-manager-stats">
                <div>
                  <Building2 size={21} />
                  <strong>Companies</strong>
                  <span>Registered organizations</span>
                </div>

                <div>
                  <Activity size={21} />
                  <strong>Company Status</strong>
                  <span>Active and inactive tracking</span>
                </div>

                <div>
                  <BarChart3 size={21} />
                  <strong>Platform Statistics</strong>
                  <span>Overall platform insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section section-padding">
        <div className="section-container contact-card">
          <div>
            <span className="section-label">LET'S CONNECT</span>
            <h2>Ready to organize your workforce?</h2>
            <p>
              Get started with a centralized employee management experience.
            </p>
          </div>

          <Link to="/register" className="primary-button">
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
