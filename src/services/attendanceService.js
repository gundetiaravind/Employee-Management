
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/api/admin/attendance";

// Get the authenticated employee's attendance records
const getMyAttendance = async () => {
  const response = await axiosInstance.get("/api/attendance/me");
  return response.data;
};

// Mark attendance
const markAttendance = async (attendanceData) => {
  const response = await axiosInstance.post(BASE_URL, attendanceData);
  return response.data;
};

// Get all attendance records
const getAllAttendance = async () => {
  const response = await axiosInstance.get(BASE_URL);
  return response.data;
};

// Get attendance by ID
const getAttendanceById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Update attendance
const updateAttendance = async (id, attendanceData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${id}`,
    attendanceData
  );
  return response.data;
};

// Get attendance by employee ID
const getAttendanceByEmployee = async (employeeId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/employee/${employeeId}`
  );
  return response.data;
};

export default {
  getMyAttendance,
  markAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  getAttendanceByEmployee,
};
