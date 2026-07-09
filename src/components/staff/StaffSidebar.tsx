import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Car, LogOut, MapPin, User } from "lucide-react";
import { staffMenu } from "../../constants/staffMenu";
import axiosClient from "../../api/axiosClient";

type StaffUser = {
  fullName?: string;
  FullName?: string;
  email?: string;
  Email?: string;
  branchId?: number;
  BranchID?: number;
};

function getStaffUser(): StaffUser | null {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("Nhân viên");
  const [branchName, setBranchName] = useState("Chưa xác định chi nhánh");

  useEffect(() => {
    const user = getStaffUser();

    if (!user) {
      return;
    }

    setStaffName(
      user.fullName || user.FullName || user.email || user.Email || "Nhân viên"
    );

    const branchId = user.branchId || user.BranchID;

    if (!branchId) {
      return;
    }

    axiosClient
      .get(`/api/branches/${branchId}`)
      .then((res) => {
        const branch = res.data?.data;
        setBranchName(
          branch?.BranchName || branch?.branchName || `Chi nhánh #${branchId}`
        );
      })
      .catch(() => {
        setBranchName(`Chi nhánh #${branchId}`);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-slate-800 bg-slate-900 text-white">
      <div>
        <div className="flex items-center gap-3 border-b border-slate-800 p-5">
          <div className="rounded-lg bg-blue-600 p-2">
            <Car size={24} className="text-white" />
          </div>

          <div>
            <h1 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent">
              AutoWash Pro
            </h1>

            <p className="text-xs text-slate-400">Phân hệ Nhân viên</p>
          </div>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {staffMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/staff"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/40 p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500 bg-slate-700">
            <User size={18} className="text-blue-400" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{staffName}</p>

            <p className="mt-1 flex items-start gap-1 text-xs text-slate-400">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{branchName}</span>
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Đang làm ca
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
