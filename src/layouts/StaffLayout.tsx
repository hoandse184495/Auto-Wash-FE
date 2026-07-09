import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
import axiosClient from "../api/axiosClient";

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

const StaffLayout: React.FC = () => {
  const [staffName, setStaffName] = useState("Nhân viên");
  const [staffEmail, setStaffEmail] = useState("");
  const [branchName, setBranchName] = useState("Chưa xác định chi nhánh");

  useEffect(() => {
    const user = getStaffUser();

    if (!user) {
      return;
    }

    setStaffName(
      user.fullName || user.FullName || user.email || user.Email || "Nhân viên"
    );
    setStaffEmail(user.email || user.Email || "");

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="ml-64 min-h-screen flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Bảng điều khiển Nhân viên
            </h1>
            <p className="text-sm text-slate-500">{branchName}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">
                {staffName}
              </p>
              <p className="text-xs text-emerald-500">
                ● Đang làm việc{staffEmail ? ` • ${staffEmail}` : ""}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {staffName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
