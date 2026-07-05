import { FileText, Sparkles } from "lucide-react";
import type { Branch, Service, Vehicle } from "./bookingTypes";
import { formatMoney } from "./bookingUtils";

type BookingSummaryProps = {
  fullName: string;
  phone: string;
  bookingDate: string;
  startTime: string;
  servicePrice: number;
  selectedBranch?: Branch;
  selectedVehicle?: Vehicle;
  selectedService?: Service;
};

const BookingSummary = ({
  fullName,
  phone,
  bookingDate,
  startTime,
  servicePrice,
  selectedBranch,
  selectedVehicle,
  selectedService,
}: BookingSummaryProps) => {
  const rows = [
    ["Khách hàng", fullName || "Chưa nhập"],
    ["Số điện thoại", phone || "Chưa nhập"],
    ["Chi nhánh", selectedBranch?.BranchName || "Chưa chọn"],
    ["Xe", selectedVehicle?.LicensePlate || "Chưa chọn"],
    ["Dịch vụ", selectedService?.ServiceName || "Chưa chọn"],
    [
      "Ngày giờ",
      `${bookingDate || "Chưa chọn"}${startTime ? ` lúc ${startTime}` : ""}`,
    ],
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
              Tóm tắt
            </p>
            <h2 className="text-xl font-bold text-slate-950">Lịch hẹn</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="mt-1 font-semibold text-slate-900">{value}</p>
            </div>
          ))}

          <div className="border-t border-slate-200 pt-5">
            <p className="text-slate-500">Thanh toán dự kiến</p>
            <p className="mt-1 text-3xl font-bold text-sky-700">
              {formatMoney(servicePrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-950 p-5 text-white shadow-lg shadow-slate-200">
        <p className="flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-sky-300" />
          Mẹo nhỏ
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Hãy chọn chi nhánh và ngày trước để hệ thống tải đúng khung giờ còn
          trống. Nếu chưa có xe, đăng ký xe mới rồi quay lại đặt lịch.
        </p>
      </div>
    </aside>
  );
};

export default BookingSummary;
