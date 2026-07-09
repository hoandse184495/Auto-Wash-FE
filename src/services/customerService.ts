import axiosClient from "../api/axiosClient";
import { type TierConfig } from "./tierConfigService";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CustomerDetail {
  customerId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  totalVisits: number;
  totalSpent: number;
  activeVehicleCount: number;
  loyalty: {
    accountId: number | null;
    currentPoints: number;
    lifetimePoints: number;
    tierId: number | null;
    tierName: string;
    tierConfig: TierConfig | null;
  };
}

const customerService = {
  async getAllCustomers(): Promise<CustomerDetail[]> {
    const response = await axiosClient.get("/api/customers", {
      headers: getAuthHeader(),
    });

    if (!response.data?.success || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data.map((customer: Record<string, unknown>) => {
      const loyalty = (customer.loyalty as Record<string, unknown> | undefined) ?? {};

      return {
        customerId: customer.customerId as number,
        userId: ((customer.userId as number | null) ?? 0),
        fullName: (customer.fullName as string) || "Không rõ",
        email: (customer.email as string) || "",
        phone: (customer.phone as string) || "",
        status: (customer.status as string) || "Unknown",
        createdAt: (customer.createdAt as string) || "",
        totalVisits: Number(customer.totalVisits || 0),
        totalSpent: Number(customer.totalSpent || 0),
        activeVehicleCount: Number(customer.activeVehicleCount || 0),
        loyalty: {
          accountId: (loyalty.accountId as number | null) ?? null,
          currentPoints: Number(loyalty.currentPoints || 0),
          lifetimePoints: Number(loyalty.lifetimePoints || 0),
          tierId: (loyalty.tierId as number | null) ?? null,
          tierName: (loyalty.tierName as string) || "Chưa có hạng",
          tierConfig: (loyalty.tierConfig as TierConfig | null) ?? null,
        },
      };
    });
  },
};

export default customerService;
