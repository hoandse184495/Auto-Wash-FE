import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import customerApi from "../../services/customerApi";
import { getErrorMessage } from "../../api/axiosClient";
import { formatMoney, formatTime } from "../../components/customer/bookingUtils";

type BookingVehicle = {
  LicensePlate?: string | null;
  Brand?: string | null;
  Model?: string | null;
};

type BookingServiceLine = {
  LineTotal?: number | string | null;
  UnitPrice?: number | string | null;
  Services?: {
    ServiceName?: string | null;
  } | null;
};

type BookingItem = {
  BookingItemID: number;
  Status?: string | null;
  Vehicles?: BookingVehicle | null;
  ServiceLineItems?: BookingServiceLine[];
};

type BookingGroup = {
  BookingGroupID: number;
  BookingCode?: string | null;
  BookingDate?: string | null;
  StartTime?: string | null;
  Status?: string | null;
  CreatedAt?: string | null;
  branches?: {
    BranchName?: string | null;
    Address?: string | null;
  } | null;
  TransactionDiscounts?: Array<{
    DiscountType?: string | null;
    DiscountAmount?: number | string | null;
  }>;
  Transactions?: Array<{
    Subtotal?: number | string | null;
    DiscountAmount?: number | string | null;
    FinalAmount?: number | string | null;
    Status?: string | null;
  }>;
  BookingItems?: BookingItem[];
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Chua cap nhat";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

function getStatusClass(status?: string | null) {
  if (status === "Cancelled") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Confirmed") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getBookingPriceInfo(booking: BookingGroup) {
  const baseTotal = (booking.BookingItems || []).reduce((bookingTotal, item) => {
    const itemTotal = (item.ServiceLineItems || []).reduce(
      (serviceTotal, line) => serviceTotal + Number(line.LineTotal || line.UnitPrice || 0),
      0,
    );

    return bookingTotal + itemTotal;
  }, 0);

  const latestTransaction = booking.Transactions?.[0];
  if (latestTransaction) {
    return {
      baseTotal: Number(latestTransaction.Subtotal || baseTotal),
      discountTotal: Number(latestTransaction.DiscountAmount || 0),
      finalTotal: Number(latestTransaction.FinalAmount || baseTotal),
    };
  }

  const requestedPointDiscount = (booking.TransactionDiscounts || [])
    .filter((d) => d.DiscountType === "POINT_REQUEST")
    .reduce((sum, d) => sum + Number(d.DiscountAmount || 0), 0);

  const normalizedDiscount = Math.min(baseTotal, Math.max(0, requestedPointDiscount));

  return {
    baseTotal,
    discountTotal: normalizedDiscount,
    finalTotal: Math.max(0, baseTotal - normalizedDiscount),
  };
}

function isActiveBookingStatus(status?: string | null) {
  return ["Pending", "Confirmed", "CheckedIn", "InProgress"].includes(
    status || "Pending",
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedBookingIds, setExpandedBookingIds] = useState<number[]>([]);

  function toggleBookingDetails(bookingId: number) {
    setExpandedBookingIds((current) =>
      current.includes(bookingId)
        ? current.filter((id) => id !== bookingId)
        : [...current, bookingId],
    );
  }

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await customerApi.getMyBookings();
      setBookings(res.data.data || []);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function cancelBooking(bookingId: number) {
    const confirmed = window.confirm("Ban co chac muon huy lich hen nay?");

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setMessage("");

      await customerApi.cancelBooking(bookingId);
      await loadBookings();
      setMessage("Huy lich hen thanh cong");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  }

  const filteredBookings = bookings
    .filter((booking) => isActiveBookingStatus(booking.Status))
    .filter((booking) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        (booking.BookingCode || `#${booking.BookingGroupID}`).toLowerCase().includes(keyword) ||
        (booking.branches?.BranchName || "").toLowerCase().includes(keyword) ||
        (booking.branches?.Address || "").toLowerCase().includes(keyword) ||
        (booking.BookingItems || []).some((item) => {
          const vehicleText = [
            item.Vehicles?.LicensePlate,
            item.Vehicles?.Brand,
            item.Vehicles?.Model,
            ...(item.ServiceLineItems || []).map((line) => line.Services?.ServiceName),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return vehicleText.includes(keyword);
        });

      const matchesStatus =
        statusFilter === "all" || (booking.Status || "Pending") === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aTime = new Date(a.BookingDate || a.CreatedAt || 0).getTime();
      const bTime = new Date(b.BookingDate || b.CreatedAt || 0).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <section className="bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
                  <CalendarDays className="h-4 w-4" />
                  Lich hen
                </p>
                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Lich dat cua toi
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Theo doi lich hen da tao, dia diem rua xe, dich vu da chon va huy lich khi con trong thoi gian cho phep.
                </p>
              </div>

              <button
                type="button"
                onClick={loadBookings}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" />
                Tai lai
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          {message && (
            <div className="mb-6 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              Dang tai lich dat...
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <CalendarDays className="mx-auto h-12 w-12 text-sky-600" />
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                Ban chua co lich hen
              </h2>
              <p className="mt-2 text-slate-600">
                Tao lich rua xe dau tien de theo doi trang thai tai day.
              </p>
              <Link
                to="/booking"
                className="mt-6 inline-flex rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Dat lich ngay
              </Link>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <>
            <div className="mb-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm mã lịch, chi nhánh, biển số, dịch vụ..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Pending">Đang chờ</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="CheckedIn">Đã check-in</option>
                <option value="InProgress">Đang thực hiện</option>
              </select>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
                Không tìm thấy lịch hẹn phù hợp.
              </div>
            ) : (
            <div className="grid gap-5">
              {filteredBookings.map((booking) => {
                const canCancel = booking.Status === "Pending" || booking.Status === "Confirmed";
                const priceInfo = getBookingPriceInfo(booking);
                const isExpanded = expandedBookingIds.includes(booking.BookingGroupID);
                const vehicleCount = (booking.BookingItems || []).length;
                const serviceCount = (booking.BookingItems || []).reduce(
                  (total, item) => total + (item.ServiceLineItems || []).length,
                  0,
                );

                return (
                  <article
                    key={booking.BookingGroupID}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <p className="text-sm text-slate-500">Ma lich hen</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                          {booking.BookingCode || `#${booking.BookingGroupID}`}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(booking.Status)}`}
                      >
                        {booking.Status || "Pending"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <InfoLine
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Ngay hen"
                        value={formatDate(booking.BookingDate)}
                      />
                      <InfoLine
                        icon={<Clock3 className="h-4 w-4" />}
                        label="Gio bat dau"
                        value={formatTime(booking.StartTime)}
                      />
                      <InfoLine
                        icon={<MapPin className="h-4 w-4" />}
                        label="Chi nhanh"
                        value={booking.branches?.BranchName || "Chua cap nhat"}
                      />
                    </div>

                    <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm text-slate-500">
                          Tạm tính: <span className="text-xl font-bold text-sky-700">{formatMoney(priceInfo.finalTotal)}</span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {vehicleCount} xe, {serviceCount} dịch vụ
                        </p>
                        {priceInfo.discountTotal > 0 && (
                          <p className="mt-1 text-xs text-emerald-700">
                            Đã giảm {formatMoney(priceInfo.discountTotal)} từ điểm/ưu đãi
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleBookingDetails(booking.BookingGroupID)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                      >
                        {isExpanded ? (
                          <>
                            Thu gọn
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Xem chi tiết
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelBooking(booking.BookingGroupID)}
                          disabled={cancellingId === booking.BookingGroupID}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancellingId === booking.BookingGroupID ? "Dang huy..." : "Huy lich"}
                        </button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                        {booking.branches?.Address && (
                          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {booking.branches.Address}
                          </p>
                        )}

                        {(booking.BookingItems || []).map((item) => (
                          <div
                            key={item.BookingItemID}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row">
                              <p className="flex items-center gap-2 font-bold text-slate-950">
                                <Car className="h-4 w-4 text-sky-600" />
                                {item.Vehicles?.LicensePlate || "Xe chua cap nhat"}
                                {item.Vehicles?.Brand ? ` - ${item.Vehicles.Brand}` : ""}
                                {item.Vehicles?.Model ? ` ${item.Vehicles.Model}` : ""}
                              </p>
                              <span className="text-sm font-semibold text-slate-600">
                                {item.Status || "Pending"}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                              {(item.ServiceLineItems || []).map((line) => (
                                <p key={`${item.BookingItemID}-${line.Services?.ServiceName || line.UnitPrice}`}>
                                  {line.Services?.ServiceName || "Dich vu"} - {formatMoney(line.LineTotal || line.UnitPrice || 0)}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

type InfoLineProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoLine = ({ icon, label, value }: InfoLineProps) => (
  <div className="rounded-lg bg-slate-50 p-4">
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-sky-600">{icon}</span>
      {label}
    </p>
    <p className="mt-1 font-semibold text-slate-950">{value}</p>
  </div>
);

export default MyBookings;
