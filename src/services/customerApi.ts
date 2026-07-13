import axiosClient from "../api/axiosClient";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

const customerApi = {
  getProfile() {
    return axiosClient.get("/api/customers/profile", {
      headers: getAuthHeader(),
    });
  },

  getPointsSummary() {
    return axiosClient.get("/api/customers/points-summary", {
      headers: getAuthHeader(),
    });
  },

  getMyBookings() {
    return axiosClient.get("/api/bookings/me", {
      headers: getAuthHeader(),
    });
  },

  cancelBooking(bookingId: number) {
    return axiosClient.patch(
      `/api/bookings/${bookingId}/cancel`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
  },

  getBranches() {
    return axiosClient.get("/api/branches", {
      params: { status: "Active" },
    });
  },

  getBranchServices(branchId: number) {
    return axiosClient.get(`/api/branches/${branchId}/services`);
  },
};

export default customerApi;
