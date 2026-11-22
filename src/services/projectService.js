
import axiosInstance from "../utils/axiosInstance";

const createProject = async (projectData) => {
  const response = await axiosInstance.post(
    "/api/admin/projects",
    projectData
  );
  return response.data;
};

const getAllProjects = async () => {
  const response = await axiosInstance.get(
    "/api/admin/projects"
  );
  return response.data;
};

const getProjectById = async (id) => {
  const response = await axiosInstance.get(
    `/api/admin/projects/${id}`
  );
  return response.data;
};

const updateProject = async (id, projectData) => {
  const response = await axiosInstance.put(
    `/api/admin/projects/${id}`,
    projectData
  );
  return response.data;
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
};
