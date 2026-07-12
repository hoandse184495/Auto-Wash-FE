import { AlertCircle, CalendarDays, ReceiptText, Search, WalletCards } from "lucide-react";

function ManagerTransactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Giao dịch & Hóa đơn Chi nhánh</h1>
        <p className="mt-1 text-sm text-slate-500">
          Khung theo dõi thanh toán của chi nhánh. Dữ liệu thật đang chờ backend bổ sung API list/detail theo chi nhánh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<WalletCards />} title="Giao dịch trong ngày" value="Chờ API" />
        <InfoCard icon={<ReceiptText />} title="Hóa đơn đã xuất" value="Chờ API" />
        <InfoCard icon={<CalendarDays />} title="Đối soát ca/ngày" value="Chờ API" />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Cần backend bổ sung API trước khi dùng thật</p>
            <p className="mt-1 text-sm">
              Manager cần danh sách giao dịch theo chi nhánh, lọc ngày/trạng thái và xem chi tiết hóa đơn.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              disabled
              placeholder="Tìm mã giao dịch, hóa đơn, khách hàng..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-400"
            />
          </div>
          <input disabled type="date" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400" />
          <select disabled className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
            <option>Trạng thái</option>
          </select>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Chưa có dữ liệu để hiển thị vì backend chưa có API danh sách giao dịch/hóa đơn theo chi nhánh.
        </div>
      </div>
    </div>
  );
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
