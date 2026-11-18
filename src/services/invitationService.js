
import axiosInstance from "../utils/axiosInstance";

const invitationService = {

  // Send Admin or Employee invitation
  sendInvitation: async (invitationData) => {
    const response = await axiosInstance.post(
      "/api/invitations",
      invitationData
    );
    return response.data;
  },

  // Get company invitations
  getInvitations: async () => {
    const response = await axiosInstance.get("/api/invitations");
    return response.data;
  },

  // Validate invitation token
  validateInvitation: async (token) => {
    const response = await axiosInstance.get(
      "/api/invitations/validate",
      {
        params: { token }
      }
    );
    return response.data;
  },

  // Accept invitation and complete registration
  acceptInvitation: async (registrationData) => {
    const response = await axiosInstance.post(
      "/api/invitations/accept",
      registrationData
    );
    return response.data;
  },

  // Revoke invitation
  revokeInvitation: async (invitationId) => {
    const response = await axiosInstance.delete(
      `/api/invitations/${invitationId}`
    );
    return response.data;
  }

};

export default invitationService;
