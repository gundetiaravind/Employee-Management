import axiosInstance from "../utils/axiosInstance";

const getFinanceDetails = async (employeeId) => {
  const response = await axiosInstance.get(
    `/employees/${employeeId}/finance`
  );
  return response.data;
};

const updateFinanceDetails = async (employeeId, financeData) => {
  const response = await axiosInstance.put(
    `/employees/${employeeId}/finance`,
    financeData
  );
  return response.data;
};

const getCtcDetails = async (employeeId) => {
  const response = await axiosInstance.get(
    `/employees/${employeeId}/ctc`
  );
  return response.data;
};

const updateCtcDetails = async (employeeId, ctcData) => {
  const response = await axiosInstance.put(
    `/employees/${employeeId}/ctc`,
    ctcData
  );
  return response.data;
};

export default {
  getFinanceDetails,
  updateFinanceDetails,
  getCtcDetails,
  updateCtcDetails,
};