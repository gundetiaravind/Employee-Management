import axiosInstance from "../utils/axiosInstance";

const getDashboard = async () => {
  const response = await axiosInstance.get("/api/employees/me/dashboard");
  return response.data;
};

export default { getDashboard };
