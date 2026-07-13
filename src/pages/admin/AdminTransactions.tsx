import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import { getErrorMessage } from "../../api/axiosClient";
import branchService, { type Branch } from "../../services/branchService";
import transactionService, {
  type AdminTransaction,
  type TransactionListParams,
  type TransactionListResult,
} from "../../services/transactionService";

const emptyResult: TransactionListResult = {
  items: [],
  summary: { totalTransactions: 0, paidTransactions: 0, totalPaidAmount: 0 },
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
};

const formatMoney = (value: number | string | null | undefined) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)} ₫`;

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

const methodLabel: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
};

function statusView(status: string | null) {
  if (status === "Paid") {
    return { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700" };
  }
  if (status === "Cancelled") {
    return { label: "Đã hủy", className: "bg-slate-100 text-slate-600" };
  }
  return { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-700" };
}

function AdminTransactions() {
  const [result, setResult] = useState<TransactionListResult>(emptyResult);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<TransactionListParams>({
    page: 1,
    limit: 20,
  });

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await transactionService.getAll(appliedFilters);
      setResult(data);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setResult(emptyResult);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void Promise.resolve().then(loadTransactions);
  }, [loadTransactions]);

  useEffect(() => {
    void branchService.getAllBranches().then(setBranches).catch(() => setBranches([]));
  }, []);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    if (from && to && from > to) {
      setMessage("Ngày bắt đầu không được sau ngày kết thúc");
      return;
    }
    setAppliedFilters({
      search: search.trim() || undefined,
      branchId: branchId ? Number(branchId) : undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      page: 1,
      limit: 20,
    });
  }

  function resetFilters() {
    setSearch("");
    setBranchId("");
    setStatus("");
    setFrom("");
    setTo("");
    setAppliedFilters({ page: 1, limit: 20 });
  }

  function changePage(page: number) {
    if (page < 1 || page > result.pagination.totalPages) return;
    setAppliedFilters((current) => ({ ...current, page }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Giao dịch</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi các giao dịch thanh toán trên toàn hệ thống.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadTransactions()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Tải lại
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<WalletCards />}
          label="Tổng giao dịch"
          value={String(result.summary.totalTransactions)}
        />
        <SummaryCard
          icon={<CheckCircle2 />}
          label="Đã thanh toán"
          value={String(result.summary.paidTransactions)}
        />
        <SummaryCard
          icon={<CircleDollarSign />}
          label="Tổng tiền đã thanh toán"
          value={formatMoney(result.summary.totalPaidAmount)}
        />
      </div>

      <form
        onSubmit={applyFilters}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-6">
          <label className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Mã giao dịch, booking, khách hàng..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500"
            />
          </label>
          <select
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((branch) => (
              <option key={branch.BranchID} value={branch.BranchID}>
                {branch.BranchName}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
          <label className="relative">
            <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold uppercase text-slate-500">Từ ngày</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
          </label>
          <label className="relative">
            <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold uppercase text-slate-500">Đến ngày</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={resetFilters} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
            Xóa lọc
          </button>
          <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
            Lọc giao dịch
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Giao dịch / Booking</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Đang tải giao dịch...</td></tr>
              ) : result.items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">Không có giao dịch phù hợp.</td></tr>
              ) : (
                result.items.map((transaction) => (
                  <TransactionRow key={transaction.TransactionID} transaction={transaction} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {result.pagination.totalItems} giao dịch · Trang {result.pagination.page}/{result.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => changePage(result.pagination.page - 1)}
              disabled={loading || result.pagination.page <= 1}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              title="Trang trước"
            ><ChevronLeft size={18} /></button>
            <button
              type="button"
              onClick={() => changePage(result.pagination.page + 1)}
              disabled={loading || result.pagination.page >= result.pagination.totalPages}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              title="Trang sau"
            ><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: AdminTransaction }) {
  const status = statusView(transaction.Status);
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900">GD-{transaction.TransactionID}</p>
        <p className="mt-1 text-xs text-slate-500">{transaction.BookingCode || `Booking #${transaction.BookingGroupID || "—"}`}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{transaction.CustomerName || `Khách #${transaction.CustomerID}`}</p>
        <p className="mt-1 text-xs text-slate-500">{transaction.CustomerPhone || "Chưa có SĐT"}</p>
      </td>
      <td className="px-4 py-4">{transaction.BranchName || "—"}</td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900">{formatMoney(transaction.FinalAmount)}</p>
        {Number(transaction.DiscountAmount) > 0 && <p className="mt-1 text-xs text-emerald-600">Giảm {formatMoney(transaction.DiscountAmount)}</p>}
      </td>
      <td className="px-4 py-4">
        <p className="font-medium">{transaction.PaymentMethod ? methodLabel[transaction.PaymentMethod] || transaction.PaymentMethod : "Chưa thanh toán"}</p>
        {transaction.ConfirmedBy && <p className="mt-1 text-xs text-slate-500">Xác nhận: {transaction.ConfirmedBy}</p>}
      </td>
      <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
      <td className="px-4 py-4">
        <p>{formatDateTime(transaction.CreatedAt)}</p>
        {transaction.PaidAt && <p className="mt-1 text-xs text-slate-500">Thanh toán: {formatDateTime(transaction.PaidAt)}</p>}
      </td>
    </tr>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-sky-50 p-2 text-sky-600">{icon}</div>
        <div><p className="text-xl font-bold text-slate-800">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
      </div>
    </div>
  );
}

export default AdminTransactions;
