
import axiosInstance from "../utils/axiosInstance";

const companyDashboard = async (companyId) => {
  const response = await axiosInstance.get(
    `/api/company/dashboard?companyId=${companyId}`
  );

  return response.data;
};

export default {
  companyDashboard,
};
