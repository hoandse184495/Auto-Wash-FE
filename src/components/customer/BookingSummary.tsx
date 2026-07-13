import { FileText, Sparkles } from "lucide-react";
import type { Branch, Service, Vehicle } from "./bookingTypes";
import { formatMoney } from "./bookingUtils";

type BookingSummaryProps = {
  fullName: string;
  phone: string;
  bookingDate: string;
  startTime: string;
  servicePrice: number;
  selectedVehicleCount: number;
  tierDiscountPercent: number;
  tierDiscountAmount: number;
  usedPoints: number;
  pointDiscountAmount: number;
  discountAmount: number;
  finalPrice: number;
  selectedBranch?: Branch;
  selectedVehicles: Vehicle[];
  selectedVehicleServices: { vehicle: Vehicle; service?: Service }[];
};

const BookingSummary = ({
  fullName,
  phone,
  bookingDate,
  startTime,
  servicePrice,
  selectedVehicleCount,
  tierDiscountPercent,
  tierDiscountAmount,
  usedPoints,
  pointDiscountAmount,
  discountAmount,
  finalPrice,
  selectedBranch,
  selectedVehicles,
  selectedVehicleServices,
}: BookingSummaryProps) => {
  const rows = [
    ["Khách hàng", fullName || "Chưa nhập"],
    ["Số điện thoại", phone || "Chưa nhập"],
    ["Chi nhánh", selectedBranch?.BranchName || "Chưa chọn"],
    [
      "Xe",
      selectedVehicles.length > 0
        ? selectedVehicles.map((vehicle) => vehicle.LicensePlate).join(", ")
        : "Chưa chọn",
    ],
    ["Số lượng xe", selectedVehicleCount ? String(selectedVehicleCount) : "Chưa chọn"],
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
            {selectedVehicleServices.length > 0 && (
              <div className="mt-2 space-y-2 text-sm">
                {selectedVehicleServices.map(({ vehicle, service }) => (
                  <div key={vehicle.VehicleID} className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      {vehicle.LicensePlate} - {service?.ServiceName || "Chưa chọn"}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatMoney(Number(service?.ActualPrice || 0))}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xl font-bold text-slate-700 line-through">
              {formatMoney(servicePrice)}
            </p>

            {tierDiscountAmount > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Giảm theo hạng ({tierDiscountPercent}%)</span>
                <span className="font-semibold text-emerald-700">
                  -{formatMoney(tierDiscountAmount)}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Quy đổi điểm</span>
              <span className="font-semibold text-emerald-700">
                -{formatMoney(pointDiscountAmount)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Số điểm dùng</span>
              <span className="font-semibold text-slate-900">{usedPoints}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Tổng giảm</span>
              <span className="font-semibold text-emerald-700">-{formatMoney(discountAmount)}</span>
            </div>

            <p className="mt-3 text-3xl font-bold text-sky-700">
              {formatMoney(finalPrice)}
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
