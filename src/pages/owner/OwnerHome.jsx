
import {
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  TrendingUp,
  UserPlus,
  Settings,
  Building2,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import "./OwnerDashboard.css";

const stats = [
  {
    label: "Total Employees",
    value: "128",
    change: "+12% this month",
    icon: Users,
  },
  {
    label: "Total Admins",
    value: "08",
    change: "Across your organization",
    icon: ShieldCheck,
  },
  {
    label: "Active Projects",
    value: "16",
    change: "Currently running",
    icon: BriefcaseBusiness,
  },
  {
    label: "Company Growth",
    value: "18%",
    change: "Compared to last month",
    icon: TrendingUp,
  },
];

const activities = [
  {
    title: "New employee added",
    description: "An employee record was created.",
    time: "Today, 10:30 AM",
    icon: UserPlus,
  },
  {
    title: "Admin account updated",
    description: "Administrator information was updated.",
    time: "Yesterday",
    icon: ShieldCheck,
  },
  {
    title: "Company profile reviewed",
    description: "Company information was reviewed.",
    time: "2 days ago",
    icon: Settings,
  },
];

export default function OwnerHome() {
  const user = JSON.parse(
    sessionStorage.getItem("OrgConnect-demo-user") || "null"
  );

  const ownerName = user?.name || "Owner";

  return (
    <div className="owner-dashboard">
      <section className="owner-welcome">
        <div>
          <span className="owner-eyebrow">OVERVIEW</span>
          <h1>Welcome back, {ownerName}!</h1>
          <p>
            Here's what's happening in your organization today.
          </p>
        </div>

        <div className="owner-welcome-icon">
          <Building2 size={25} />
        </div>
      </section>

      <section className="owner-section">
        <div className="owner-section-heading">
          <div>
            <h2>Organization Overview</h2>
            <p>A quick look at your organization.</p>
          </div>
        </div>

        <div className="owner-stats-grid">
          {stats.map(({ label, value, change, icon: Icon }) => (
            <article className="owner-stat-card" key={label}>
              <div className="owner-stat-card-top">
                <span>{label}</span>
                <div className="owner-stat-icon">
                  <Icon size={20} />
                </div>
              </div>

              <h3>{value}</h3>
              <p>{change}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="owner-dashboard-bottom">
        <section className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest updates from your organization.</p>
            </div>
            <Activity size={20} />
          </div>

          <div className="owner-activity-list">
            {activities.map(({ title, description, time, icon: Icon }) => (
              <div className="owner-activity-item" key={title}>
                <div className="owner-activity-icon">
                  <Icon size={19} />
                </div>

                <div className="owner-activity-content">
                  <strong>{title}</strong>
                  <p>{description}</p>
                  <span>{time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="owner-panel">
          <div className="owner-panel-heading">
            <div>
              <h2>Organization Details</h2>
              <p>Your workspace information.</p>
            </div>
            <Building2 size={20} />
          </div>

          <div className="owner-company-details">
            <div>
              <span>Organization Status</span>
              <strong className="owner-status-active">Active</strong>
            </div>

            <div>
              <span>Account Type</span>
              <strong>Owner</strong>
            </div>

            <div>
              <span>Company Code</span>
              <strong>OC482916</strong>
            </div>
          </div>

          <div className="owner-demo-note">
            <ArrowUpRight size={15} />
            <span>Sample information for frontend demonstration.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
