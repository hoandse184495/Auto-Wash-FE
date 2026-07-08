import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import type { Branch, Service, Slot, Vehicle } from "./bookingTypes";
import { formatMoney, formatTime } from "./bookingUtils";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

type BookingFormProps = {
  message: string;
  fullName: string;
  setFullName: Dispatch<SetStateAction<string>>;
  phone: string;
  setPhone: Dispatch<SetStateAction<string>>;
  branchId: string;
  setBranchId: Dispatch<SetStateAction<string>>;
  vehicleId: string;
  setVehicleId: Dispatch<SetStateAction<string>>;
  serviceId: string;
  setServiceId: Dispatch<SetStateAction<string>>;
  bookingDate: string;
  setBookingDate: Dispatch<SetStateAction<string>>;
  startTime: string;
  setStartTime: Dispatch<SetStateAction<string>>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  branches: Branch[];
  vehicles: Vehicle[];
  services: Service[];
  slots: Slot[];
  setSlots: Dispatch<SetStateAction<Slot[]>>;
  today: string;
  loadingServices: boolean;
  loadingSlots: boolean;
  isSubmitting: boolean;
  selectedBranch?: Branch;
  selectedVehicle?: Vehicle;
  selectedService?: Service;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const BookingForm = ({
  message,
  fullName,
  setFullName,
  phone,
  setPhone,
  branchId,
  setBranchId,
  vehicleId,
  setVehicleId,
  serviceId,
  setServiceId,
  bookingDate,
  setBookingDate,
  startTime,
  setStartTime,
  note,
  setNote,
  branches,
  vehicles,
  services,
  slots,
  setSlots,
  today,
  loadingServices,
  loadingSlots,
  isSubmitting,
  selectedBranch,
  selectedVehicle,
  selectedService,
  onSubmit,
}: BookingFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      {message && (
        <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
            Khách hàng
          </p>
          <h2 className="text-xl font-bold text-slate-950">
            Thông tin khách hàng
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Số điện thoại <span className="text-red-500">*</span>
          </label>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-9 flex items-center gap-3 border-t border-slate-200 pt-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
            Lịch hẹn
          </p>
          <h2 className="text-xl font-bold text-slate-950">
            Thông tin đặt lịch
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Chi nhánh <span className="text-red-500">*</span>
          </label>

          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setServiceId("");
              setBookingDate("");
              setStartTime("");
              setSlots([]);
            }}
            className={inputClass}
          >
            <option value="">Chọn chi nhánh</option>

            {branches.map((branch) => (
              <option key={branch.BranchID} value={branch.BranchID}>
                {branch.BranchName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Xe <span className="text-red-500">*</span>
          </label>

          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className={inputClass}
          >
            <option value="">Chọn xe</option>

            {vehicles.map((vehicle) => (
              <option key={vehicle.VehicleID} value={vehicle.VehicleID}>
                {vehicle.LicensePlate} - {vehicle.Brand || "Chưa cập nhật"}{" "}
                {vehicle.Model || ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Ngày đặt lịch <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            min={today}
            value={bookingDate}
            onChange={(e) => {
              setBookingDate(e.target.value);
              setStartTime("");
            }}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Dịch vụ <span className="text-red-500">*</span>
          </label>

          <select
            value={serviceId}
            disabled={!branchId || loadingServices}
            onChange={(e) => setServiceId(e.target.value)}
            className={inputClass}
          >
            <option value="">
              {!branchId
                ? "Chọn chi nhánh trước"
                : loadingServices
                  ? "Đang tải dịch vụ..."
                  : "Chọn dịch vụ"}
            </option>

            {services.map((service) => (
              <option key={service.ServiceID} value={service.ServiceID}>
                {service.ServiceName} - {formatMoney(service.ActualPrice)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(selectedBranch || selectedVehicle || selectedService) && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {selectedBranch && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">Chi nhánh đã chọn</p>
              <p className="mt-3 flex gap-2 leading-6">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <span>{selectedBranch.Address || "Chưa cập nhật"}</span>
              </p>
              <p className="mt-2 flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-sky-600" />
                <span>{selectedBranch.Phone || "Chưa cập nhật"}</span>
              </p>
              <p className="mt-2 flex gap-2">
                <Clock3 className="h-4 w-4 shrink-0 text-sky-600" />
                <span>
                  {formatTime(selectedBranch.OpenTime)} -{" "}
                  {formatTime(selectedBranch.CloseTime)}
                </span>
              </p>
            </div>
          )}

          {selectedVehicle && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">Xe đã chọn</p>
              <p className="mt-3 flex gap-2">
                <Car className="h-4 w-4 shrink-0 text-sky-600" />
                <span className="font-semibold text-slate-800">
                  {selectedVehicle.LicensePlate}
                </span>
              </p>
              <p className="mt-2">
                Loại xe: {selectedVehicle.VehicleType || "Chưa cập nhật"}
              </p>
              <p className="mt-2">
                Hãng / model: {selectedVehicle.Brand || "Chưa cập nhật"}{" "}
                {selectedVehicle.Model || ""}
              </p>
              <p className="mt-2">
                Màu xe: {selectedVehicle.Color || "Chưa cập nhật"}
              </p>
            </div>
          )}

          {selectedService && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">Dịch vụ đã chọn</p>
              <p className="mt-3 font-semibold text-slate-800">
                {selectedService.ServiceName}
              </p>
              <p className="mt-2 leading-6">
                {selectedService.Description || "Chưa có mô tả"}
              </p>
              <p className="mt-2">
                Thời lượng: {selectedService.DurationMinutes || 0} phút
              </p>
              <p className="mt-2 font-bold text-sky-700">
                {formatMoney(selectedService.ActualPrice)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-9 border-t border-slate-200 pt-7">
        <label className="mb-3 block text-sm font-bold text-slate-700">
          Khung giờ <span className="text-red-500">*</span>
        </label>

        {!branchId || !bookingDate ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Vui lòng chọn chi nhánh và ngày trước.
          </p>
        ) : loadingSlots ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Đang tải khung giờ...
          </p>
        ) : slots.length === 0 ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Không có khung giờ trống.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = startTime === slot.StartTime;
              const isDisabled =
                slot.Available <= 0 || slot.Status !== "Available";

              return (
                <button
                  key={slot.StartTime}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setStartTime(slot.StartTime)}
                  className={`rounded-lg border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-100"
                      : "border-slate-300 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-700"
                  }`}
                >
                  <div className="font-bold">
                    {slot.StartTime} - {slot.EndTime}
                  </div>

                  <div
                    className={`mt-1 text-xs ${
                      isSelected ? "text-sky-50" : "text-slate-500"
                    }`}
                  >
                    {slot.ShiftName} | Còn {slot.Available} chỗ
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Ghi chú
        </label>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Xe nhiều bụi, cần rửa kỹ phần nội thất..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <CheckCircle2 className="h-5 w-5" />
          {isSubmitting ? "Đang đặt lịch..." : "Đặt lịch"}
        </button>

        <Link
          to="/register-car"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
        >
          <Plus className="h-5 w-5" />
          Đăng ký xe mới
        </Link>
      </div>
    </form>
  );
};

export default BookingForm;
