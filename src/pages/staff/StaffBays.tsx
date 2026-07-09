import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Car,
  CheckCircle2,
  Clock3,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import {
  fetchTodayBookings,
  flattenStaffBookings,
  formatTime,
  getNextStatus,
  getServicesText,
  getStatusClass,
  getStatusLabel,
  updateBookingItemStatus,
} from "./staffOperations";
import type { StaffFlatItem } from "./staffOperations";

const bayColumns = [
  {
    status: "Pending",
    title: "Chờ xử lý",
    description: "Xe đã đặt lịch, chờ check-in",
    icon: <Clock3 size={18} />,
    color: "border-amber-200 bg-amber-50",
  },
  {
    status: "CheckedIn",
    title: "Đã check-in",
    description: "Xe đã tới, chờ bắt đầu rửa",
    icon: <Car size={18} />,
    color: "border-blue-200 bg-blue-50",
  },
  {
    status: "InProgress",
    title: "Đang rửa",
    description: "Xe đang được xử lý tại trạm",
    icon: <Bike size={18} />,
    color: "border-purple-200 bg-purple-50",
  },
  {
    status: "Completed",
    title: "Hoàn thành",
    description: "Xe đã hoàn thành trong ngày",
    icon: <CheckCircle2 size={18} />,
    color: "border-emerald-200 bg-emerald-50",
  },
];

const StaffBays = () => {
  const [items, setItems] = useState<StaffFlatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setIsLoading(true);
      setMessage("");
      const bookings = await fetchTodayBookings();
      setItems(flattenStaffBookings(bookings));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được trạm rửa");
    } finally {
      setIsLoading(false);
    }
  }

  async function moveNext(item: StaffFlatItem) {
    const next = getNextStatus(item.status);

    if (!next) {
      return;
    }

    try {
      setIsUpdatingId(item.bookingItemId);
      setMessage("");
      await updateBookingItemStatus(item.bookingItemId, next.status);
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdatingId(null);
    }
  }

  const groupedItems = useMemo(() => {
    return bayColumns.reduce<Record<string, StaffFlatItem[]>>((acc, column) => {
      acc[column.status] = items.filter((item) => item.status === column.status);
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trạm Rửa Xe</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bảng vận hành theo trạng thái xe trong ngày tại chi nhánh.
          </p>
        </div>

        <button
          type="button"
          onClick={loadItems}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {bayColumns.map((column) => (
            <section
              key={column.status}
              className={`rounded-xl border p-4 ${column.color}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 text-slate-700 shadow-sm">
                    {column.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">{column.title}</h2>
                    <p className="text-xs text-slate-500">{column.description}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                  {groupedItems[column.status]?.length || 0}
                </span>
              </div>

              <div className="max-h-[calc(100vh-300px)] space-y-3 overflow-y-auto pr-1">
                {(groupedItems[column.status] || []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm text-slate-500">
                    Không có xe
                  </div>
                ) : (
                  groupedItems[column.status].map((item) => (
                    <BayCard
                      key={item.bookingItemId}
                      item={item}
                      isUpdating={isUpdatingId === item.bookingItemId}
                      onNext={() => moveNext(item)}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

function BayCard({
  item,
  isUpdating,
  onNext,
}: {
  item: StaffFlatItem;
  isUpdating: boolean;
  onNext: () => void;
}) {
  const next = getNextStatus(item.status);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold text-blue-600">
            {item.licensePlate}
          </p>
          <p className="text-xs text-slate-500">{item.vehicleName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-800">Khách:</span>{" "}
          {item.customerName}
        </p>
        <p>
          <span className="font-medium text-slate-800">Giờ:</span>{" "}
          {formatTime(item.startTime)}
        </p>
        <p className="line-clamp-2">
          <span className="font-medium text-slate-800">Dịch vụ:</span>{" "}
          {getServicesText(item)}
        </p>
      </div>

      {next && (
        <button
          type="button"
          onClick={onNext}
          disabled={isUpdating}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300"
        >
          <PlayCircle size={16} />
          {isUpdating ? "Đang cập nhật..." : next.label}
        </button>
      )}
    </article>
  );
}

export default StaffBays;
