import axiosClient from "../api/axiosClient";

export interface BranchConfig {
  ConfigID?: number;
  BranchID: number;
  SlotDuration: number;
  TotalWashBays: number;
  BufferMinutes: number;
  MaxCarsPerBooking: number;
  CancelWindowHours: number;
}

export interface BranchConfigPayload {
  BranchID: number;
  SlotDuration?: number;
  TotalWashBays?: number;
  BufferMinutes?: number;
  MaxCarsPerBooking?: number;
  CancelWindowHours?: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const branchConfigService = {
  async getConfig(branchId?: number): Promise<BranchConfig | null> {
    const response = await axiosClient.get("/api/branch-configs", {
      params: branchId ? { BranchID: branchId } : undefined,
      headers: getAuthHeader(),
    });

    if (response.data?.success) {
      return (response.data.data as BranchConfig | null) ?? null;
    }

    return null;
  },

  async upsertConfig(payload: BranchConfigPayload): Promise<BranchConfig> {
    const response = await axiosClient.post("/api/branch-configs", payload, {
      headers: getAuthHeader(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Cập nhật cấu hình chi nhánh thất bại");
    }

    return response.data.data as BranchConfig;
  },
};

export default branchConfigService;