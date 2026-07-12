import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  Building2,
  ReceiptText,
  Tags,
  Settings2,
  CalendarClock,
} from "lucide-react";

export const managerMenu = [
  {
    path: "/manager",
    name: "Tổng quan",
    icon: <LayoutDashboard size={20} />,
  },
  {
    path: "/manager/staff",
    name: "Quản lý Nhân viên",
    icon: <Users size={20} />,
  },
  {
    path: "/manager/bookings",
    name: "Quản lý Đặt lịch",
    icon: <CalendarCheck size={20} />,
  },
  {
    path: "/manager/promotions",
    name: "Khuyến mãi",
    icon: <Tags size={20} />,
  },
  {
    path: "/manager/branch-operations",
    name: "Dịch vụ & Cấu hình",
    icon: <Settings2 size={20} />,
  },
  {
    path: "/manager/workforce",
    name: "Ca làm & Phân lịch",
    icon: <CalendarClock size={20} />,
  },
  {
    path: "/manager/transactions",
    name: "Giao dịch & Hóa đơn",
    icon: <ReceiptText size={20} />,
  },
  {
    path: "/manager/statistics",
    name: "Thống kê",
    icon: <BarChart3 size={20} />,
  },
  {
    path: "/manager/branch",
    name: "Thông tin Chi nhánh",
    icon: <Building2 size={20} />,
  },
];
