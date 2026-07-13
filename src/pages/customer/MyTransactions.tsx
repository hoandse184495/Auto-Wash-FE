import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Car,
  Clock3,
  MapPin,
  RefreshCcw,
  Search,
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
  Transactions?: Array<{
    Subtotal?: number | string | null;
    DiscountAmount?: number | string | null;
    FinalAmount?: number | string | null;
  }>;
  BookingItems?: BookingItem[];
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleDateString("vi-VN");
}

function getBookingFinalAmount(booking: BookingGroup) {
  const latestTransaction = booking.Transactions?.[0];
  if (latestTransaction?.FinalAmount !== undefined && latestTransaction?.FinalAmount !== null) {
    return Number(latestTransaction.FinalAmount || 0);
  }

  return (booking.BookingItems || []).reduce((bookingTotal, item) => {
    const itemTotal = (item.ServiceLineItems || []).reduce(
      (serviceTotal, line) => serviceTotal + Number(line.LineTotal || line.UnitPrice || 0),
      0,
    );
    return bookingTotal + itemTotal;
  }, 0);
}

function MyTransactions() {
  const [bookings, setBookings] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await customerApi.getMyBookings();
      const completedBookings = (res.data.data || []).filter(
        (booking: BookingGroup) => booking.Status === "Completed",
      );
      setBookings(completedBookings);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredBookings = bookings
    .filter((booking) => {
      const keyword = searchTerm.trim().toLowerCase();
      if (!keyword) return true;

      return (
        (booking.BookingCode || `#${booking.BookingGroupID}`).toLowerCase().includes(keyword) ||
        (booking.branches?.BranchName || "").toLowerCase().includes(keyword) ||
        (booking.BookingItems || []).some((item) =>
          [
            item.Vehicles?.LicensePlate,
            item.Vehicles?.Brand,
            item.Vehicles?.Model,
            ...(item.ServiceLineItems || []).map((line) => line.Services?.ServiceName),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword),
        )
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.BookingDate || a.CreatedAt || 0).getTime();
      const bTime = new Date(b.BookingDate || b.CreatedAt || 0).getTime();
      return bTime - aTime;
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
                  Lịch sử giao dịch
                </p>
                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Các lịch đã hoàn thành</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Xem lại các lịch hẹn đã hoàn thành cùng chi phí thực tế sau khi áp dụng ưu đãi.
                </p>
              </div>

              <button
                type="button"
                onClick={loadTransactions}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" />
                Tải lại
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

          {!loading && bookings.length > 0 && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm mã lịch, chi nhánh, biển số, dịch vụ..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              Đang tải lịch sử giao dịch...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
              <CalendarDays className="mx-auto h-12 w-12 text-sky-600" />
              <h2 className="mt-4 text-xl font-bold text-slate-950">Chưa có lịch hoàn thành</h2>
              <p className="mt-2 text-slate-600">Khi lịch hẹn hoàn thành, giao dịch sẽ hiển thị tại đây.</p>
              <Link
                to="/customer/bookings"
                className="mt-6 inline-flex rounded-lg bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Xem lịch hẹn đang đặt
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredBookings.map((booking) => {
                const finalAmount = getBookingFinalAmount(booking);

                return (
                  <article
                    key={booking.BookingGroupID}
                    className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <p className="text-sm text-slate-500">Mã lịch hẹn</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                          {booking.BookingCode || `#${booking.BookingGroupID}`}
                        </h2>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        Hoàn thành
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <InfoLine
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Ngày hẹn"
                        value={formatDate(booking.BookingDate)}
                      />
                      <InfoLine
                        icon={<Clock3 className="h-4 w-4" />}
                        label="Giờ bắt đầu"
                        value={formatTime(booking.StartTime)}
                      />
                      <InfoLine
                        icon={<MapPin className="h-4 w-4" />}
                        label="Chi nhánh"
                        value={booking.branches?.BranchName || "Chưa cập nhật"}
                      />
                    </div>

                    <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                      {(booking.BookingItems || []).map((item) => (
                        <div
                          key={item.BookingItemID}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="flex items-center gap-2 font-bold text-slate-950">
                            <Car className="h-4 w-4 text-sky-600" />
                            {item.Vehicles?.LicensePlate || "Xe chưa cập nhật"}
                            {item.Vehicles?.Brand ? ` - ${item.Vehicles.Brand}` : ""}
                            {item.Vehicles?.Model ? ` ${item.Vehicles.Model}` : ""}
                          </p>

                          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                            {(item.ServiceLineItems || []).map((line) => (
                              <p key={`${item.BookingItemID}-${line.Services?.ServiceName || line.UnitPrice}`}>
                                {line.Services?.ServiceName || "Dịch vụ"} - {formatMoney(line.LineTotal || line.UnitPrice || 0)}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-5 text-sm text-slate-500">
                      Thành tiền: <span className="text-xl font-bold text-sky-700">{formatMoney(finalAmount)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
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

export default MyTransactions;
