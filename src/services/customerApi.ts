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

  getRewards() {
    return axiosClient.get("/api/rewards");
  },

  redeemReward(rewardId: number) {
    return axiosClient.post(
      "/api/rewards/redeem",
      { RewardID: rewardId },
      {
        headers: getAuthHeader(),
      },
    );
  },

  getRewardRedemptions(customerId: number) {
    return axiosClient.get(`/api/rewards/customer/${customerId}`, {
      headers: getAuthHeader(),
    });
  },

  getActivePromotions() {
    return axiosClient.get("/api/promotions/active");
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
