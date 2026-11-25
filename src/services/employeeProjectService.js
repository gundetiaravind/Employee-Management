
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/api/admin/employee-projects";

// Assign employee to project
const assignEmployee = async (assignmentData) => {
  const response = await axiosInstance.post(
    BASE_URL,
    assignmentData
  );
  return response.data;
};

// Get all employee-project assignments
const getAllAssignments = async () => {
  const response = await axiosInstance.get(BASE_URL);
  return response.data;
};

// Get assignments by employee ID
const getAssignmentsByEmployee = async (employeeId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/employee/${employeeId}`
  );
  return response.data;
};

// Get assignments by project ID
const getAssignmentsByProject = async (projectId) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/project/${projectId}`
  );
  return response.data;
};

// Get individual assignment
const getAssignmentById = async (id) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/${id}`
  );
  return response.data;
};

// Update assignment
const updateAssignment = async (id, assignmentData) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/${id}`,
    assignmentData
  );
  return response.data;
};

// Close assignment
const closeAssignment = async (id) => {
  const response = await axiosInstance.patch(
    `${BASE_URL}/${id}/close`
  );
  return response.data;
};

export default {
  assignEmployee,
  getAllAssignments,
  getAssignmentsByEmployee,
  getAssignmentsByProject,
  getAssignmentById,
  updateAssignment,
  closeAssignment,
};
