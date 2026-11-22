
import axiosInstance from "../utils/axiosInstance";

const uploadPayslip = async (employeeId, payslipMonth, payslipYear, file) => {
  const formData = new FormData();
  formData.append("payslipMonth", payslipMonth);
  formData.append("payslipYear", payslipYear);
  formData.append("file", file);

  const response = await axiosInstance.post(
    `/api/employees/${employeeId}/payslips`,
    formData
  );

  return response.data;
};

const getEmployeePayslips = async (employeeId) => {
  const response = await axiosInstance.get(
    `/api/employees/${employeeId}/payslips`
  );
  return response.data;
};

const getMyPayslips = async () => {
  const response = await axiosInstance.get(
    "/api/employees/me/payslips"
  );
  return response.data;
};

const downloadPayslip = async (payslipId) => {
  const response = await axiosInstance.get(
    `/api/payslips/${payslipId}/download`,
    { responseType: "blob" }
  );
  return response.data;
};

const deletePayslip = async (payslipId) => {
  const response = await axiosInstance.delete(
    `/api/payslips/${payslipId}`
  );
  return response.data;
};

export default {
  uploadPayslip,
  getEmployeePayslips,
  getMyPayslips,
  downloadPayslip,
  deletePayslip,
};
