import axiosClient from "../api/axiosClient";

export interface AdminTransaction {
  TransactionID: number;
  BookingGroupID: number | null;
  BookingCode: string | null;
  CustomerID: number;
  CustomerName: string | null;
  CustomerPhone: string | null;
  BranchID: number | null;
  BranchName: string | null;
  Subtotal: number | string | null;
  DiscountAmount: number | string | null;
  FinalAmount: number | string | null;
  Status: string | null;
  PaymentMethod: string | null;
  PaymentStatus: string | null;
  PaymentReference: string | null;
  ConfirmedBy: string | null;
  CreatedAt: string | null;
  PaidAt: string | null;
}

export interface TransactionListResult {
  items: AdminTransaction[];
  summary: {
    totalTransactions: number;
    paidTransactions: number;
    totalPaidAmount: number | string;
  };
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface TransactionListParams {
  branchId?: number;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const transactionService = {
  async getAll(params: TransactionListParams = {}): Promise<TransactionListResult> {
    const response = await axiosClient.get("/api/transactions", {
      params,
      headers: authHeaders(),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Không tải được danh sách giao dịch");
    }

    return response.data.data as TransactionListResult;
  },
};

export default transactionService;
