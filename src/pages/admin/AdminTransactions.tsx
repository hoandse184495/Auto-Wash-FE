import { AlertCircle, FileText, ReceiptText, Search, WalletCards } from "lucide-react";

const missingApis = [
  "GET /api/transactions?branchId=&status=&from=&to=",
  "GET /api/transactions/:transactionId",
  "GET /api/invoices?branchId=&from=&to=",
  "GET /api/invoices/:invoiceId",
];

function AdminTransactions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Giao dịch & Hóa đơn</h1>
          <p className="mt-1 text-sm text-slate-500">
            Khung quản trị giao dịch toàn hệ thống. Phần dữ liệu thật đang chờ backend bổ sung API danh sách và chi tiết.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={<WalletCards />} label="Tổng giao dịch" value="Chờ API" />
        <SummaryCard icon={<ReceiptText />} label="Hóa đơn đã xuất" value="Chờ API" />
        <SummaryCard icon={<FileText />} label="Doanh thu đối soát" value="Chờ API" />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Chưa thể hiển thị dữ liệu thật</p>
            <p className="mt-1 text-sm">
              Backend hiện có API tạo/thanh toán/xuất hóa đơn, nhưng chưa có API list/search để Admin xem lại toàn hệ thống.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
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
          <select disabled className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
            <option>Chi nhánh</option>
          </select>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã giao dịch</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                  Đang chờ backend bổ sung API danh sách giao dịch/hóa đơn.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800">API cần bổ sung</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {missingApis.map((api) => (
            <code key={api} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {api}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-rose-50 p-2 text-rose-600">{icon}</div>
        <div>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminTransactions;
