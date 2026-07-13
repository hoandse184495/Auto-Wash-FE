import axiosClient from "../api/axiosClient";

export interface ServiceCatalogItem {
  ServiceID: number;
  ServiceName: string;
  Description?: string | null;
  BasePrice?: number | string;
  DurationMinutes?: number | null;
  Type?: string | null;
  Status?: string | null;
}

export interface BranchServiceAssignment {
  BranchServiceID: number;
  BranchID: number;
  ServiceID: number;
  PriceOverride: number | string | null;
  Status: string | null;
  Services?: ServiceCatalogItem;
  branches?: {
    BranchID: number;
    BranchName: string;
  };
}

export interface BranchServicePayload {
  BranchID: number;
  ServiceID: number;
  PriceOverride?: number | null;
  Status?: "Active" | "Inactive";
}

export interface BranchServiceUpdatePayload {
  PriceOverride?: number | null;
  Status?: "Active" | "Inactive";
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const branchServiceAssignmentService = {
  async getAssignedServices(branchId: number): Promise<BranchServiceAssignment[]> {
    const response = await axiosClient.get("/api/branch-services", {
      params: { BranchID: branchId },
      headers: getAuthHeader(),
    });

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data as BranchServiceAssignment[];
    }

    return [];
  },

  async getServiceCatalog(): Promise<ServiceCatalogItem[]> {
    const response = await axiosClient.get("/api/services", {
      params: { Status: "Active" },
    });

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data as ServiceCatalogItem[];
    }

    return [];
  },

  async createAssignment(payload: BranchServicePayload): Promise<BranchServiceAssignment> {
    const response = await axiosClient.post("/api/branch-services", payload, {
      headers: getAuthHeader(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Gán dịch vụ thất bại");
    }

    return response.data.data as BranchServiceAssignment;
  },

  async updateAssignment(id: number, payload: BranchServiceUpdatePayload): Promise<BranchServiceAssignment> {
    const response = await axiosClient.put(`/api/branch-services/${id}`, payload, {
      headers: getAuthHeader(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Cập nhật dịch vụ thất bại");
    }

    return response.data.data as BranchServiceAssignment;
  },

  async deleteAssignment(id: number): Promise<void> {
    const response = await axiosClient.delete(`/api/branch-services/${id}`, {
      headers: getAuthHeader(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Xóa dịch vụ thất bại");
    }
  },
};

export default branchServiceAssignmentService;
