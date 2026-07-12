import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import {
  fetchTodayBookings,
  flattenStaffBookings,
  formatDate,
  formatTime,
  getServicesText,
  getTodayInputValue,
} from "./staffOperations";
import type { StaffFlatItem } from "./staffOperations";

const StaffHistory = () => {
  const [items, setItems] = useState<StaffFlatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingDate, setBookingDate] = useState(getTodayInputValue());

  useEffect(() => {
    loadHistory();
  }, [bookingDate]);

  async function loadHistory() {
    try {
      setIsLoading(true);
      setMessage("");
      const bookings = await fetchTodayBookings({ status: "Completed", bookingDate });
      setItems(flattenStaffBookings(bookings));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được lịch sử ca rửa");
    } finally {
      setIsLoading(false);
    }
  }

  const completedItems = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return items
      .filter((item) => item.status === "Completed")
      .filter((item) => {
        if (!keyword) {
          return true;
        }

        return (
          item.bookingCode.toLowerCase().includes(keyword) ||
          item.customerName.toLowerCase().includes(keyword) ||
          item.customerPhone.includes(searchTerm) ||
          item.licensePlate.toLowerCase().includes(keyword) ||
          item.vehicleName.toLowerCase().includes(keyword)
        );
      });
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Lịch sử Ca Rửa
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách xe đã hoàn thành trong ngày tại chi nhánh.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
          type="button"
          onClick={loadHistory}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Làm mới
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{completedItems.length}</p>
              <p className="text-xs text-slate-500">Xe hoàn thành</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CalendarDays />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">
                {formatDate(bookingDate)}
              </p>
              <p className="text-xs text-slate-500">Ngày làm việc</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Clock3 />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Trong ngày</p>
              <p className="text-xs text-slate-500">Theo dữ liệu booking hôm nay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Tìm mã booking, khách hàng, SĐT, biển số..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Booking</th>
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Xe</th>
                <th className="px-5 py-4">Dịch vụ</th>
                <th className="px-5 py-4">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  </td>
                </tr>
              ) : completedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Chưa có xe hoàn thành trong ngày
                  </td>
                </tr>
              ) : (
                completedItems.map((item) => (
                  <tr key={item.bookingItemId} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm font-semibold text-blue-600">
                        {item.bookingCode}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(item.bookingDate)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.customerName}</p>
                          <p className="text-xs text-slate-500">{item.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-slate-400" />
                        <div>
                          <p className="font-mono font-semibold text-slate-800">
                            {item.licensePlate}
                          </p>
                          <p className="text-xs text-slate-500">{item.vehicleName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                      {getServicesText(item)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div className="space-y-1">
                        <p>Check-in: {formatTime(item.checkInAt)}</p>
                        <p>Bắt đầu: {formatTime(item.washStartAt)}</p>
                        <p className="font-semibold text-emerald-700">
                          Hoàn thành: {formatTime(item.completedAt)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffHistory;
