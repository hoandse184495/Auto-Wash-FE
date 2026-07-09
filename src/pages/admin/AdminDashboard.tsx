import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserCog,
  Car,
  DollarSign,
  Shield,
} from "lucide-react";
import StatCard from "../../components/admin/AdminStatCard";
import userService from "../../services/userService";
import branchService from "../../services/branchService";
import revenueService from "../../services/revenueService";
import customerService from "../../services/customerService";

interface BranchStats {
  branchID: number;
  branchName: string;
  address: string | null;
  managerName: string;
  totalStaff: number;
  revenue: number;
  status: "Active" | "Inactive";
}

interface AdminStats {
  totalBranches: number;
  totalManagers: number;
  totalStaff: number;
  totalCustomers: number;
  monthlyRevenue: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalBranches: 0,
    totalManagers: 0,
    totalStaff: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
  });
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [branchesData, managersData, staffData, customersData] = await Promise.all([
          branchService.getAllBranches(),
          userService.getAllUsers({ Role: "Manager" }),
          userService.getAllUsers({ Role: "Staff" }),
          customerService.getAllCustomers(),
        ]);

        const activeBranches = branchesData.filter((branch) => branch.Status === "Active");
        const activeManagers = managersData.filter((manager) => manager.Status === "Active");
        const activeStaff = staffData.filter((staff) => staff.Status === "Active");
        const activeCustomers = customersData.filter((customer) => customer.status === "Active");

        const performance = await revenueService.getBranchPerformance();
        const revenueMap = new Map<number, number>();
        performance.forEach((item) => {
          revenueMap.set(item.branchID, item.monthlyRevenue);
        });
        const managerMap = new Map<number, string>();
        const staffMap = new Map<number, number>();

        activeManagers.forEach((manager) => {
          if (manager.BranchID) {
            managerMap.set(manager.BranchID, manager.FullName);
          }
        });

        activeStaff.forEach((staff) => {
          if (staff.BranchID) {
            staffMap.set(staff.BranchID, (staffMap.get(staff.BranchID) || 0) + 1);
          }
        });

        const branchStatsData: BranchStats[] = branchesData.map((branch) => ({
          branchID: branch.BranchID,
          branchName: branch.BranchName,
          address: branch.Address,
          managerName: managerMap.get(branch.BranchID) || "Chưa phân công",
          totalStaff: staffMap.get(branch.BranchID) || 0,
          revenue: revenueMap.get(branch.BranchID) || 0,
          status: branch.Status,
        }));

        setStats({
          totalBranches: activeBranches.length,
          totalManagers: activeManagers.length,
          totalStaff: activeStaff.length,
          totalCustomers: activeCustomers.length,
          monthlyRevenue: branchStatsData.reduce((sum, branch) => sum + branch.revenue, 0),
          activeUsers: activeManagers.length + activeStaff.length + activeCustomers.length,
        });
        setBranchStats(branchStatsData);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    } catch {
      return null;
    }

    return null;
  };

  const user = getUserFromStorage();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-white shadow-xl shadow-rose-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Chào mừng, {user?.fullName || user?.username || "Admin"}!
            </h2>
            <p className="mt-1 text-rose-100">
              Tổng quan hệ thống Auto Wash Pro với {stats.totalBranches} chi nhánh đang hoạt động.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Tổng chi nhánh" value={stats.totalBranches} icon={<Building2 size={24} />} color="blue" />
        <StatCard title="Tổng Manager" value={stats.totalManagers} icon={<UserCog size={24} />} color="purple" />
        <StatCard title="Tổng Staff" value={stats.totalStaff} icon={<Users size={24} />} color="emerald" />
        <StatCard title="Tổng khách hàng" value={stats.totalCustomers.toLocaleString("vi-VN")} icon={<Car size={24} />} color="rose" />
        <StatCard title="Doanh thu tháng" value={formatCurrency(stats.monthlyRevenue)} icon={<DollarSign size={24} />} color="amber" />
        <StatCard title="Người dùng hoạt động" value={stats.activeUsers} icon={<Shield size={24} />} color="blue" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Hiệu suất các chi nhánh</h3>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi nhân sự, người quản lý và doanh thu theo chi nhánh từ dữ liệu backend hiện có.
            </p>
          </div>
          <a href="/admin/branches" className="text-sm font-medium text-rose-600 hover:text-rose-700">
            Xem chi tiết →
          </a>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {branchStats.map((branch) => (
              <div
                key={branch.branchID}
                className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-rose-100 p-2">
                      <Building2 size={20} className="text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{branch.branchName}</p>
                      <p className="text-xs text-slate-500">Mã CN: #{branch.branchID}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      branch.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        branch.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    ></span>
                    {branch.status === "Active" ? "Hoạt động" : "Ngừng"}
                  </span>
                </div>

                <div className="space-y-3">
                  {branch.address && (
                    <div className="mb-1 flex items-start text-xs text-slate-500">
                      <span className="mr-1">📍</span>
                      <span className="line-clamp-1">{branch.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Manager phụ trách</span>
                    <span className="font-semibold text-slate-800">{branch.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Staff hoạt động</span>
                    <span className="font-semibold text-slate-800">{branch.totalStaff}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Doanh thu trong kỳ</span>
                      <span className="font-bold text-rose-600">{formatCurrency(branch.revenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <a
          href="/admin/managers"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 transition group-hover:bg-purple-200">
              <UserCog size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Quản lý Manager</p>
              <p className="mt-0.5 text-xs text-slate-500">Tạo và phân công Manager cho các chi nhánh</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/staff"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-3 transition group-hover:bg-emerald-200">
              <Users size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Quản lý Staff</p>
              <p className="mt-0.5 text-xs text-slate-500">Tạo và phân công Staff theo chi nhánh</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/branches"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 transition group-hover:bg-blue-200">
              <Building2 size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Dữ liệu chi nhánh</p>
              <p className="mt-0.5 text-xs text-slate-500">Xem chi tiết toàn bộ dữ liệu {stats.totalBranches} chi nhánh</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;