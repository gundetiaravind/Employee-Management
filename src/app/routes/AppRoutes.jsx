
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import {
  getAuth,
  getCurrentUser,
  getDashboardPath,
  isAuthenticated,
} from "../../services/authService";

import PublicLayout from "../../public-site/layouts/PublicLayout";
import Login from "../../auth/Login/Login";
import Register from "../../auth/Register/Register";
import CompanyRegistration from "../../company/CompanyRegistration/CompanyRegistration";
import EmployeeRegistration from "../../auth/EmployeeRegistration/EmployeeRegistration";
import EmailVerification from "../../auth/EmailVerification/EmailVerification";
import PlatformManagerDashboard from "../../pages/platform-manager/PlatformManagerDashboard";

import OwnerDashboard from "../../pages/owner/OwnerDashboard";
import OwnerHome from "../../pages/owner/OwnerHome";
import ManageAdmins from "../../pages/owner/ManageAdmins";
import ManageEmployees from "../../pages/owner/ManageEmployees";
import CompanySettings from "../../pages/owner/CompanySettings";
import OwnerProfile from "../../pages/owner/OwnerProfile";

import AdminDashboard from "../../pages/admin/AdminDashboard";
import AdminHome from "../../pages/admin/AdminHome";
import AdminManageEmployees from "../../pages/admin/ManageEmployees";
import Departments from "../../pages/admin/Departments";
import Attendance from "../../pages/admin/Attendance";
import LeaveManagement from "../../pages/admin/LeaveManagement";
import Payroll from "../../pages/admin/Payroll";
import Reports from "../../pages/admin/Reports";
import WorkAllocation from "../../pages/admin/WorkAllocation";
import AdminProfile from "../../pages/admin/AdminProfile";

import EmployeeDashboard, {
  EmployeeHome,
} from "../../pages/employee/EmployeeDashboard";

import MyProfile from "../../pages/employee/MyProfile";
import EmployeeLeaveManagement from "../../pages/employee/LeaveManagement";
import MyAttendance from "../../pages/employee/MyAttendance";
import MyPayroll from "../../pages/employee/MyPayroll";
import MyWork from "../../pages/employee/MyWork";

// Authentication and role protection
function AuthGuard({ allowedRoles, children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const verifyUser = async () => {
      if (!isAuthenticated()) {
        if (active) setStatus("unauthorized");
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!active) return;

        const userRole = String(user.role || "")
          .replace(/^ROLE_/, "")
          .toUpperCase();

        const permittedRoles = allowedRoles.map((role) =>
          String(role).replace(/^ROLE_/, "").toUpperCase()
        );

        setStatus(
          permittedRoles.includes(userRole)
            ? "authorized"
            : "unauthorized"
        );
      } catch {
        if (active) {
          setStatus("unauthorized");
        }
      }
    };

    verifyUser();

    return () => {
      active = false;
    };
  }, [allowedRoles]);

  if (status === "checking") {
    return <div>Verifying your account...</div>;
  }

  if (status === "unauthorized") {
    const auth = getAuth();

    return (
      <Navigate
        to={
          auth?.accessToken
            ? getDashboardPath(auth.role)
            : "/login"
        }
        replace
      />
    );
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC PAGES */}
      <Route path="/" element={<PublicLayout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/register/company"
        element={<CompanyRegistration />}
      />

      <Route
        path="/register/employee"
        element={<EmployeeRegistration />}
      />
<Route
  path="/verify-email"
  element={<EmailVerification />}
/>
      {/* PLATFORM MANAGER */}
      <Route
        path="/platform-manager/dashboard"
        element={
          <AuthGuard allowedRoles={["PLATFORM_MANAGER"]}>
            <PlatformManagerDashboard />
          </AuthGuard>
        }
      />

      {/* OWNER WORKSPACE */}
      <Route
        path="/owner"
        element={
          <AuthGuard allowedRoles={["COMPANY_OWNER"]}>
            <OwnerDashboard />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OwnerHome />} />
        <Route path="admins" element={<ManageAdmins />} />
        <Route path="employees" element={<ManageEmployees />} />
        <Route path="company" element={<CompanySettings />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      {/* ADMIN WORKSPACE */}
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="employees" element={<AdminManageEmployees />} />
        <Route path="departments" element={<Departments />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="work-allocation" element={<WorkAllocation />} />
      </Route>

      {/* EMPLOYEE WORKSPACE */}
      <Route
        path="/employee"
        element={
          <AuthGuard allowedRoles={["EMPLOYEE"]}>
            <EmployeeDashboard />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeHome />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="leaves" element={<EmployeeLeaveManagement />} />
        <Route path="payroll" element={<MyPayroll />} />
        <Route path="work" element={<MyWork />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
