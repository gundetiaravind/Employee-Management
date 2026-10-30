
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import PublicLayout from "../../public-site/layouts/PublicLayout";
import Login from "../../auth/Login/Login";
import Register from "../../auth/Register/Register";
import CompanyRegistration from "../../company/CompanyRegistration/CompanyRegistration";
import EmployeeRegistration from "../../auth/EmployeeRegistration/EmployeeRegistration";

import OwnerDashboard from "../../pages/owner/OwnerDashboard";
import OwnerHome from "../../pages/owner/OwnerHome";
import ManageAdmins from "../../pages/owner/ManageAdmins";
import ManageEmployees from "../../pages/owner/ManageEmployees";
import CompanySettings from "../../pages/owner/CompanySettings";
import OwnerProfile from "../../pages/owner/OwnerProfile";

function DemoDashboard({ role }) {
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem("OrgConnect-demo-user") || "null"
  );

  if (!user || user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("OrgConnect-demo-user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "40px", background: "var(--bg)", minHeight: "100vh" }}>
      <h1>
        {role === "ADMIN" ? "Admin Dashboard" : "Employee Dashboard"}
      </h1>
      <p>Welcome, {user.name}!</p>
      <p>{user.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<PublicLayout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/company" element={<CompanyRegistration />} />
      <Route path="/register/employee" element={<EmployeeRegistration />} />

      {/* Owner dashboard */}
      <Route path="/owner" element={<OwnerDashboard />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OwnerHome />} />
        <Route path="admins" element={<ManageAdmins />} />
        <Route path="employees" element={<ManageEmployees />} />
        <Route path="company" element={<CompanySettings />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin/dashboard"
        element={<DemoDashboard role="ADMIN" />}
      />

      {/* Employee dashboard */}
      <Route
        path="/employee/dashboard"
        element={<DemoDashboard role="EMPLOYEE" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
