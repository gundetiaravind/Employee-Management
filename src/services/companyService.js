
import axiosInstance from "../utils/axiosInstance";

const companyDashboard = async () => {
  const response = await axiosInstance.get(
    "/api/company/dashboard"
  );

  return response.data;
};

const getCompanySettings = async () => {
  const response = await axiosInstance.get(
    "/api/company/settings"
  );

  return response.data;
};

const updateCompanySettings = async (settingsData) => {
  const response = await axiosInstance.put(
    "/api/company/settings",
    settingsData
  );

  return response.data;
};

const getCompanyProfile = async () => {
  const response = await axiosInstance.get(
    "/api/company/profile"
  );

  return response.data;
};

export default {
  companyDashboard,
  getCompanySettings,
  updateCompanySettings,
  getCompanyProfile,
};
