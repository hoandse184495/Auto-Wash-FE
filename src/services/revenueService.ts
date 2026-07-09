import axiosClient from "../api/axiosClient";

export interface DailyCashflowItem {
  date: string;
  cash: number;
  transfer: number;
  other: number;
  total: number;
}

export interface CashflowResponse {
  dailyData: DailyCashflowItem[];
  summary: {
    totalCash: number;
    totalTransfer: number;
    totalOther: number;
    total: number;
  };
}

export interface BranchPerformanceItem {
  branchID: number;
  todayBookings: number;
  monthBookings: number;
  monthlyRevenue: number;
}

export interface RevenueQuery {
  BranchID?: number;
  StartDate?: string;
  EndDate?: string;
  branchId?: number;
  startDate?: string;
  endDate?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const revenueService = {
  async getDailyCashflow(query: RevenueQuery = {}): Promise<CashflowResponse> {
    const params: Record<string, string> = {};
    const branchId = query.branchId ?? query.BranchID;
    const startDate = query.startDate ?? query.StartDate;
    const endDate = query.endDate ?? query.EndDate;

    if (branchId !== undefined) params.branchId = String(branchId);
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosClient.get("/api/dashboard/daily-cashflow", {
      headers: getAuthHeader(),
      params,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Không lấy được dữ liệu doanh thu");
    }

    return response.data.data as CashflowResponse;
  },

  async getBranchPerformance(branchId?: number): Promise<BranchPerformanceItem[]> {
    const params: Record<string, string> = {};
    if (branchId !== undefined) {
      params.branchId = String(branchId);
    }

    const response = await axiosClient.get("/api/dashboard/branch-performance", {
      headers: getAuthHeader(),
      params,
    });

    if (!response.data?.success || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data as BranchPerformanceItem[];
  },
};

export default revenueService;
