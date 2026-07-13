import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, WalletCards, Coins, Banknote, CreditCard, TrendingUp } from "lucide-react";
import revenueService, { type CashflowResponse, type DailyCashflowItem } from "../../services/revenueService";

const PERIOD_OPTIONS = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
] as const;

type Period = (typeof PERIOD_OPTIONS)[number]["value"];

function getPeriodRange(period: Period) {
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);

  if (period === "week") {
    startDate.setDate(today.getDate() - 6);
  } else if (period === "month") {
    startDate.setMonth(today.getMonth() - 1);
  } else {
    startDate.setFullYear(today.getFullYear() - 1);
  }

  const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

  return {
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function sumItems(items: DailyCashflowItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.cash += item.cash;
      acc.transfer += item.transfer;
      acc.other += item.other;
      acc.total += item.total;
      return acc;
    },
    { cash: 0, transfer: 0, other: 0, total: 0 }
  );
}

const ManagerStatistics = () => {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<CashflowResponse>({
    dailyData: [],
    summary: {
      totalCash: 0,
      totalTransfer: 0,
      totalOther: 0,
      total: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setMessage("");

        const { startDate, endDate } = getPeriodRange(period);
        const response = await revenueService.getDailyCashflow({ startDate, endDate });
        setData(response);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu thống kê");
        setData({
          dailyData: [],
          summary: {
            totalCash: 0,
            totalTransfer: 0,
            totalOther: 0,
            total: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [period]);

  const totals = useMemo(() => sumItems(data.dailyData), [data.dailyData]);
  const averagePerDay = data.dailyData.length > 0 ? Math.round(totals.total / data.dailyData.length) : 0;
  const highestDay = useMemo(() => {
    if (data.dailyData.length === 0) return null;
    return data.dailyData.reduce((best, current) => (current.total > best.total ? current : best), data.dailyData[0]);
  }, [data.dailyData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thống kê Chi nhánh</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi doanh thu theo ngày, phương thức thanh toán và hiệu suất theo khoảng thời gian.
          </p>
        </div>

        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                period === option.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(totals.total)}
          icon={<WalletCards className="text-blue-600" size={24} />}
          helper={`Trong ${data.dailyData.length} ngày có dữ liệu`}
        />
        <StatCard
          title="Tiền mặt"
          value={formatCurrency(totals.cash)}
          icon={<Banknote className="text-emerald-600" size={24} />}
          helper={`${totals.total > 0 ? Math.round((totals.cash / totals.total) * 100) : 0}% tổng doanh thu`}
        />
        <StatCard
          title="Chuyển khoản"
          value={formatCurrency(totals.transfer)}
          icon={<CreditCard className="text-cyan-600" size={24} />}
          helper={`${totals.total > 0 ? Math.round((totals.transfer / totals.total) * 100) : 0}% tổng doanh thu`}
        />
        <StatCard
          title="Khác"
          value={formatCurrency(totals.other)}
          icon={<Coins className="text-amber-600" size={24} />}
          helper={`${totals.total > 0 ? Math.round((totals.other / totals.total) * 100) : 0}% tổng doanh thu`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Doanh thu theo ngày</h2>
              <p className="text-sm text-slate-500">Danh sách thay cho biểu đồ lịch hẹn, dễ đọc hơn trên màn quản lý.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Download size={16} />
              Xuất file
            </button>
          </div>

          {message && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3 text-right">Tiền mặt</th>
                  <th className="px-4 py-3 text-right">Chuyển khoản</th>
                  <th className="px-4 py-3 text-right">Khác</th>
                  <th className="px-4 py-3 text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Đang tải dữ liệu thống kê...
                    </td>
                  </tr>
                ) : data.dailyData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Chưa có dữ liệu trong khoảng thời gian đã chọn.
                    </td>
                  </tr>
                ) : (
                  data.dailyData.map((item) => (
                    <tr key={item.date} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{formatDateLabel(item.date)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.cash)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.transfer)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.other)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatCurrency(item.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold">
                <tr>
                  <td className="px-4 py-3">Tổng cộng</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.cash)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.transfer)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.other)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(totals.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Số ngày có dữ liệu</p>
                <p className="text-2xl font-bold text-slate-800">{data.dailyData.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Trung bình mỗi ngày</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(averagePerDay)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Ngày doanh thu cao nhất</h3>
            <div className="mt-3 rounded-lg bg-slate-50 p-4">
              {highestDay ? (
                <>
                  <p className="font-medium text-slate-800">{formatDateLabel(highestDay.date)}</p>
                  <p className="mt-1 text-sm text-slate-500">Doanh thu: {formatCurrency(highestDay.total)}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Chưa có dữ liệu.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  title,
  value,
  icon,
  helper,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">{icon}</div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export default ManagerStatistics;
