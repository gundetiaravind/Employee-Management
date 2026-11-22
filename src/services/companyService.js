
import axiosInstance from "../utils/axiosInstance";

const companyDashboard = async (companyId) => {
  const response = await axiosInstance.get(
    `/api/company/dashboard?companyId=${companyId}`
  );

  return response.data;
};

const getCompanyEmployees = async () => {
  const response = await axiosInstance.get(
    "/api/company/employees"
  );

  return response.data;
};

export default {
  companyDashboard,
  getCompanyEmployees,
};
