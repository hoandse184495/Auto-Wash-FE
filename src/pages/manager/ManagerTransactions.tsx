import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Car, Search, WalletCards } from "lucide-react";
import {
  fetchTodayBookings,
  formatDate,
  formatTime,
  getTodayInputValue,
  type StaffBooking,
  type StaffBookingItem,
} from "../staff/staffOperations";

type PaymentState = "paid" | "unpaid";

type ManagerTransactionRow = {
  bookingCode: string;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  serviceName: string;
  totalAmount: number;
  status: string;
  paymentState: PaymentState;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value || 0);
}

function getBookingPaymentState(booking: StaffBooking): PaymentState {
  const hasPaidTransaction =
    booking.Transactions?.some(
      (transaction) => String(transaction?.Status || "").toLowerCase() === "paid"
    ) || false;

  return hasPaidTransaction ? "paid" : "unpaid";
}

function getItemServiceTotal(item: StaffBookingItem) {
  return (item.ServiceLineItems || []).reduce((sum, line) => {
    const lineTotal = toNumber(line.LineTotal);
    if (lineTotal > 0) return sum + lineTotal;

    const unitPrice = toNumber(line.UnitPrice);
    const quantity = toNumber(line.Quantity || 1) || 1;
    return sum + unitPrice * quantity;
  }, 0);
}

function getBookingDiscountTotal(booking: StaffBooking) {
  return (booking.TransactionDiscounts || [])
    .filter((discount) => discount.DiscountType === "POINT_REQUEST")
    .reduce((sum, discount) => sum + toNumber(discount.DiscountAmount), 0);
}

function getBookingFinalTotal(booking: StaffBooking, serviceTotal: number) {
  const latestTransaction = booking.Transactions?.[0];

  if (latestTransaction?.FinalAmount !== undefined && latestTransaction?.FinalAmount !== null) {
    return toNumber(latestTransaction.FinalAmount);
  }

  const requestedDiscount = Math.min(serviceTotal, Math.max(0, getBookingDiscountTotal(booking)));
  return Math.max(0, serviceTotal - requestedDiscount);
}

function ManagerTransactions() {
  const [bookings, setBookings] = useState<StaffBooking[]>([]);
  const [bookingDate, setBookingDate] = useState(getTodayInputValue());
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentState>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setMessage("");
        const data = await fetchTodayBookings({ bookingDate });
        setBookings(data);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu giao dịch");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [bookingDate]);

  const rows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const mappedRows: ManagerTransactionRow[] = bookings.flatMap((booking) => {
      const paymentState = getBookingPaymentState(booking);
      const allItems = booking.BookingItems || [];
      const completedItems = allItems.filter((item) => item.Status !== "Cancelled");

      if (paymentFilter !== "all" && paymentState !== paymentFilter) {
        return [];
      }

      const serviceTotal = completedItems.reduce((sum, item) => sum + getItemServiceTotal(item), 0);
      const bookingTotal = getBookingFinalTotal(booking, serviceTotal);
      const serviceName = completedItems
        .flatMap((item) => (item.ServiceLineItems || []).map((line) => line.Services?.ServiceName).filter(Boolean))
        .join(", ") || "Chưa có dịch vụ";

      const customerName = booking.Customers?.Users?.FullName || "Chưa có tên";
      const customerPhone = booking.Customers?.Users?.Phone || "Chưa có SĐT";
      const licensePlate =
        completedItems.map((item) => item.Vehicles?.LicensePlate).filter(Boolean)[0] || "Chưa có biển số";

      const firstItem = completedItems[0] || allItems[0];
      const status = firstItem?.Status || booking.Status || "Pending";

      return [
        {
          bookingCode: booking.BookingCode || `BG-${booking.BookingGroupID}`,
          bookingDate: booking.BookingDate,
          bookingTime: formatTime(booking.StartTime),
          customerName,
          customerPhone,
          licensePlate,
          serviceName,
          totalAmount: bookingTotal,
          status,
          paymentState,
        },
      ];
    });

    return mappedRows.filter((row) => {
      if (!keyword) return true;
      return (
        row.bookingCode.toLowerCase().includes(keyword) ||
        row.customerName.toLowerCase().includes(keyword) ||
        row.customerPhone.includes(searchTerm) ||
        row.licensePlate.toLowerCase().includes(keyword)
      );
    });
  }, [bookings, searchTerm, paymentFilter]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.total += row.totalAmount;
          if (row.paymentState === "paid") acc.paid += row.totalAmount;
          else acc.unpaid += row.totalAmount;
          return acc;
        },
        { total: 0, paid: 0, unpaid: 0 }
      ),
    [rows]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Giao dịch Chi nhánh</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hiển thị toàn bộ booking theo ngày đã chọn, kèm tổng tiền của mỗi booking và trạng thái thanh toán.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<CalendarDays />} title="Tổng booking" value={String(rows.length)} />
        <InfoCard icon={<WalletCards />} title="Đã thanh toán" value={formatCurrency(totals.paid)} />
        <InfoCard icon={<WalletCards />} title="Chưa thanh toán" value={formatCurrency(totals.unpaid)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã booking, khách hàng, SĐT, biển số..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentState)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Mã booking</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Xe</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Ngày giờ</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Không có booking phù hợp cho ngày đã chọn.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.bookingCode} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">{row.bookingCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{row.customerName}</p>
                      <p className="text-xs text-slate-500">{row.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Car size={15} className="text-slate-400" />
                        <span className="font-mono text-slate-800">{row.licensePlate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.serviceName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{formatDate(row.bookingDate)}</p>
                      <p className="text-xs text-slate-500">{row.bookingTime}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.paymentState === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.paymentState === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan={5}>Tổng cộng</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(totals.total)}</td>
                <td className="px-4 py-3">{rows.length} booking</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
        <div>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default ManagerTransactions;
