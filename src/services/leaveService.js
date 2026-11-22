
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/api/admin/leaves";

const leaveService = {
  getAllLeaves: async () => {
    const response = await axiosInstance.get(BASE_URL);
    return response.data;
  },

  getLeavesByStatus: async (status) => {
    const response = await axiosInstance.get(BASE_URL, {
      params: { status },
    });
    return response.data;
  },

  getLeaveById: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  approveLeave: async (id, adminRemarks = "") => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${id}/approve`,
      { adminRemarks }
    );
    return response.data;
  },

  rejectLeave: async (id, adminRemarks = "") => {
    const response = await axiosInstance.put(
      `${BASE_URL}/${id}/reject`,
      { adminRemarks }
    );
    return response.data;
  },
};

export default leaveService;
