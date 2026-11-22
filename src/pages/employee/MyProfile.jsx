import { useEffect, useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  IdCard,
  ShieldCheck,
  Contact,
} from "lucide-react";

import axios from "axios";
import { getToken } from "../../services/authService";

import "./MyProfile.css";


// Format date from backend
function formatDate(date) {
  if (!date) return "Not provided";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}


export default function MyProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");


  // Fetch logged-in employee profile
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        // Get JWT from orgconnect-auth
        const token = getToken();

        console.log("Employee JWT:", token);

        if (!token) {
          throw new Error("Authentication token not found. Please login again.");
        }

        const response = await axios.get(
          "http://localhost:8080/api/employees/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Employee profile response:", response.data);

        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch employee profile:", error);

        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Backend response:", error.response.data);
        }

        setErrorMessage(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);


  // Loading state
  if (loading) {
    return (
      <section className="employee-profile-page">
        <div className="employee-profile-heading">
          <div>
            <span className="employee-eyebrow">
              EMPLOYEE ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Loading your personal and professional information...
            </p>
          </div>
        </div>

        <section className="employee-profile-card">
          <div className="employee-profile-overview-info">
            <h2>Loading profile...</h2>
            <p>Please wait while we fetch your information.</p>
          </div>
        </section>
      </section>
    );
  }


  // Error state
  if (errorMessage) {
    return (
      <section className="employee-profile-page">
        <div className="employee-profile-heading">
          <div>
            <span className="employee-eyebrow">
              EMPLOYEE ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              View your personal and professional information.
            </p>
          </div>
        </div>

        <div className="employee-profile-alert error">
          <ShieldCheck size={18} />

          <span>{errorMessage}</span>
        </div>
      </section>
    );
  }


  // No profile data
  if (!profile) {
    return (
      <section className="employee-profile-page">
        <div className="employee-profile-heading">
          <div>
            <span className="employee-eyebrow">
              EMPLOYEE ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              View your personal and professional information.
            </p>
          </div>
        </div>

        <section className="employee-profile-card">
          <div className="employee-profile-overview-info">
            <h2>No profile data found</h2>

            <p>
              Employee profile information is not available.
            </p>
          </div>
        </section>
      </section>
    );
  }


  // Employee initials
  const initials = (profile.name || profile.fullName || "Employee")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");


  // Personal information
  const personalFields = [
    {
      label: "Full Name",
      value: profile.name || profile.fullName,
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: profile.email,
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: profile.phone,
      icon: Phone,
    },
    {
      label: "Alternate Phone",
      value: profile.alterPhone,
      icon: Contact,
    },
  ];


  // Employment information
  const employmentFields = [
    {
      label: "Employee ID",
      value: profile.employeeId,
      icon: IdCard,
    },
    {
      label: "Department",
      value: profile.department,
      icon: Building2,
    },
    {
      label: "Designation",
      value: profile.designation,
      icon: BriefcaseBusiness,
    },
    {
      label: "Joining Date",
      value: formatDate(profile.joiningDate),
      icon: CalendarDays,
    },
    {
      label: "Employment Type",
      value: profile.employmentType,
      icon: Contact,
    },
    {
      label: "Reporting Manager",
      value: profile.reportingManager,
      icon: UserRound,
    },
  ];


  return (
    <section className="employee-profile-page">

      {/* PAGE HEADER */}
      <div className="employee-profile-heading">

        <div>
          <span className="employee-eyebrow">
            EMPLOYEE ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            View your personal and professional information.
          </p>
        </div>

      </div>


      {/* PROFILE OVERVIEW */}
      <section className="employee-profile-card employee-profile-overview">

        <div className="employee-profile-avatar">
          {profile.profilePhotoUrl ? (
            <img
              src={`http://localhost:8080${profile.profilePhotoUrl}`}
              alt={profile.name || profile.fullName || "Employee"}
              className="employee-profile-photo"
            />
          ) : (
            initials || <UserRound size={34} />
          )}

          <span className="employee-profile-avatar-status" />
        </div>


        <div className="employee-profile-overview-info">

          <h2>
            {profile.name ||
              profile.fullName ||
              "Employee Name"}
          </h2>

          <p>
            {profile.designation || "Employee"}
          </p>

          <span className="employee-profile-id">

            <IdCard size={14} />

            {profile.employeeId || "Employee ID not provided"}

          </span>

        </div>


        <div className="employee-profile-status">

          <span className="employee-profile-status-dot" />

          Employee Account

        </div>

      </section>


      {/* PERSONAL INFORMATION */}
      <section className="employee-profile-card">

        <div className="employee-profile-section-heading">

          <div className="employee-profile-section-icon">
            <UserRound size={19} />
          </div>

          <div>

            <h2>Personal Information</h2>

            <p>
              Your personal and contact details
            </p>

          </div>

        </div>


        <div className="employee-profile-fields">

          {personalFields.map((field) => {

            const Icon = field.icon;

            return (
              <div
                className="employee-profile-field"
                key={field.label}
              >

                <label>
                  {field.label}
                </label>

                <div className="employee-profile-readonly">

                  <Icon size={17} />

                  <span>
                    {field.value || "Not provided"}
                  </span>

                </div>

              </div>
            );

          })}

        </div>

      </section>


      {/* ADDRESS INFORMATION */}
      <section className="employee-profile-card">

        <div className="employee-profile-section-heading">

          <div className="employee-profile-section-icon">
            <MapPin size={19} />
          </div>

          <div>

            <h2>Address Information</h2>

            <p>
              Your current residential address
            </p>

          </div>

        </div>


        <div className="employee-profile-fields">

          {/* Address */}
          <div className="employee-profile-field full-width">

            <label>
              Address
            </label>

            <div className="employee-profile-readonly">

              <MapPin size={17} />

              <span>
                {profile.address || "Not provided"}
              </span>

            </div>

          </div>


          {/* City */}
          <div className="employee-profile-field">

            <label>
              City
            </label>

            <div className="employee-profile-readonly">

              <MapPin size={17} />

              <span>
                {profile.city || "Not provided"}
              </span>

            </div>

          </div>


          {/* State */}
          <div className="employee-profile-field">

            <label>
              State
            </label>

            <div className="employee-profile-readonly">

              <MapPin size={17} />

              <span>
                {profile.state || "Not provided"}
              </span>

            </div>

          </div>


          {/* Postal Code */}
          <div className="employee-profile-field">

            <label>
              Postal Code
            </label>

            <div className="employee-profile-readonly">

              <MapPin size={17} />

              <span>
                {profile.postalCode || "Not provided"}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* EMPLOYMENT INFORMATION */}
      <section className="employee-profile-card">

        <div className="employee-profile-section-heading">

          <div className="employee-profile-section-icon">
            <BriefcaseBusiness size={19} />
          </div>

          <div>

            <h2>Employment Information</h2>

            <p>
              Your company and job details
            </p>

          </div>

        </div>


        <div className="employee-profile-fields">

          {employmentFields.map((field) => {

            const Icon = field.icon;

            return (
              <div
                className="employee-profile-field"
                key={field.label}
              >

                <label>
                  {field.label}
                </label>

                <div className="employee-profile-readonly">

                  <Icon size={17} />

                  <span>
                    {field.value || "Not provided"}
                  </span>

                </div>

              </div>
            );

          })}

        </div>


        <div className="employee-profile-readonly-note">

          <ShieldCheck size={16} />

          Employment details are managed by your company administrator.

        </div>

      </section>

    </section>
  );
}