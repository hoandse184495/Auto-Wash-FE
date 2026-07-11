import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  DollarSign,
  Users,
  UserCog,
} from "lucide-react";
import branchService, { type Branch } from "../../services/branchService";
import revenueService from "../../services/revenueService";
import userService from "../../services/userService";
import customerService from "../../services/customerService";

interface BranchStats {
  branchID: number;
  revenue: number;
  staff: number;
  managerName: string;
  status: string;
}

const AdminStatistics = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [totals, setTotals] = useState({
    revenue: 0,
    customers: 0,
    staff: 0,
    managers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [branchList, staffList, managerList, customerList] = await Promise.all([
          branchService.getAllBranches(),
          userService.getAllUsers({ Role: "Staff" }),
          userService.getAllUsers({ Role: "Manager" }),
          customerService.getAllCustomers(),
        ]);

        setBranches(branchList);

        const activeStaff = staffList.filter((staff) => staff.Status === "Active");
        const activeManagers = managerList.filter((manager) => manager.Status === "Active");
        const activeCustomers = customerList.filter((customer) => customer.status === "Active");

        const performance = await revenueService.getBranchPerformance();
        const revenueMap = new Map<number, number>();
        performance.forEach((item) => {
          revenueMap.set(item.branchID, item.monthlyRevenue);
        });
        const staffMap = new Map<number, number>();
        const managerMap = new Map<number, string>();

        activeStaff.forEach((staff) => {
          if (staff.BranchID) {
            staffMap.set(staff.BranchID, (staffMap.get(staff.BranchID) || 0) + 1);
          }
        });

        activeManagers.forEach((manager) => {
          if (manager.BranchID) {
            managerMap.set(manager.BranchID, manager.FullName);
          }
        });

        const stats: BranchStats[] = branchList.map((branch) => ({
          branchID: branch.BranchID,
          revenue: revenueMap.get(branch.BranchID) || 0,
          staff: staffMap.get(branch.BranchID) || 0,
          managerName: managerMap.get(branch.BranchID) || "Chưa phân công",
          status: branch.Status,
        }));

        setBranchStats(stats);
        setTotals({
          revenue: stats.reduce((sum, item) => sum + item.revenue, 0),
          customers: activeCustomers.length,
          staff: activeStaff.length,
          managers: activeManagers.length,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const maxRevenue = Math.max(...branchStats.map((branch) => branch.revenue), 1);
  const maxStaff = Math.max(...branchStats.map((branch) => branch.staff), 1);

  const getBranchName = (branchId: number) =>
    branches.find((branch) => branch.BranchID === branchId)?.BranchName || `CN ${branchId}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thống kê toàn hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">
            So sánh doanh thu và nhân sự các chi nhánh theo dữ liệu backend hiện có
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {(["week", "month", "year"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                period === item ? "bg-rose-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item === "week" ? "Tuần" : item === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng doanh thu</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(totals.revenue)}</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng khách hàng</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{totals.customers.toLocaleString("vi-VN")}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng Manager</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{totals.managers}</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <UserCog size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng Staff</p>
              <p className="mt-2 text-2xl font-bold text-slate-800">{totals.staff}</p>
            </div>
            <div className="rounded-lg bg-rose-100 p-3">
              <Users size={24} className="text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <DollarSign size={18} className="text-emerald-600" />
                Doanh thu theo chi nhánh
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Dữ liệu tổng hợp từ API dashboard theo từng chi nhánh</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : (
              branchStats.map((branch) => (
                <div key={branch.branchID}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{getBranchName(branch.branchID)}</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(branch.revenue)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                      style={{ width: `${(branch.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                <Users size={18} className="text-blue-600" />
                Staff theo chi nhánh
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Số lượng staff đang hoạt động tại từng chi nhánh</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              branchStats.map((branch) => (
                <div key={branch.branchID}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{getBranchName(branch.branchID)}</span>
                    <span className="font-semibold text-blue-600">{branch.staff.toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${(branch.staff / maxStaff) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
          <BarChart3 size={18} className="text-rose-600" />
          Bảng so sánh chi tiết
        </h3>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Chi nhánh</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Doanh thu</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchStats.map((branch) => (
                  <tr key={branch.branchID} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-rose-600" />
                        <span className="font-medium text-slate-800">{getBranchName(branch.branchID)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{branch.managerName}</td>
                    <td className="px-4 py-4 text-slate-700">{branch.staff}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600">{formatCurrency(branch.revenue)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          branch.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {branch.status === "Active" ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
