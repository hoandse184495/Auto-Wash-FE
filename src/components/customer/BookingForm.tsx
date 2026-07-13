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
  vehicleIds: string[];
  setVehicleIds: Dispatch<SetStateAction<string[]>>;
  vehicleServiceIds: Record<string, string>;
  setVehicleServiceIds: Dispatch<SetStateAction<Record<string, string>>>;
  bookingDate: string;
  setBookingDate: Dispatch<SetStateAction<string>>;
  startTime: string;
  setStartTime: Dispatch<SetStateAction<string>>;
  usePoints: string;
  setUsePoints: Dispatch<SetStateAction<string>>;
  availablePoints: number;
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
  selectedVehicles: Vehicle[];
  selectedVehicleServices: { vehicle: Vehicle; service?: Service }[];
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
  vehicleIds,
  setVehicleIds,
  vehicleServiceIds,
  setVehicleServiceIds,
  bookingDate,
  setBookingDate,
  startTime,
  setStartTime,
  usePoints,
  setUsePoints,
  availablePoints,
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
  selectedVehicles,
  selectedVehicleServices,
  onSubmit,
}: BookingFormProps) => {
  const selectedVehicleCount = selectedVehicles.length;
  const toggleVehicle = (id: number) => {
    const value = String(id);
    setVehicleIds((current) => {
      if (!current.includes(value)) return [...current, value];
      setVehicleServiceIds((servicesByVehicle) => {
        const next = { ...servicesByVehicle };
        delete next[value];
        return next;
      });
      return current.filter((item) => item !== value);
    });
    setStartTime("");
  };

  const setVehicleService = (vehicleId: number, serviceId: string) => {
    setVehicleServiceIds((current) => ({
      ...current,
      [String(vehicleId)]: serviceId,
    }));
  };

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
              setVehicleServiceIds({});
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

          <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2">
            {vehicles.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">
                Bạn chưa có xe nào. Vui lòng đăng ký xe mới.
              </p>
            ) : (
              <div className="space-y-2">
                {vehicles.map((vehicle) => {
                  const checked = vehicleIds.includes(String(vehicle.VehicleID));
                  return (
                    <label
                      key={vehicle.VehicleID}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                        checked
                          ? "border-sky-500 bg-sky-50"
                          : "border-slate-200 hover:border-sky-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVehicle(vehicle.VehicleID)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        <span className="block font-semibold text-slate-800">
                          {vehicle.LicensePlate}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {vehicle.Brand || "Chưa cập nhật"} {vehicle.Model || ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Đã chọn {selectedVehicleCount} xe. Khung giờ phải còn đủ chỗ cho số xe đã chọn.
          </p>
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

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Dịch vụ theo từng xe <span className="text-red-500">*</span>
          </label>

          {selectedVehicles.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Chọn xe trước để chọn dịch vụ.
            </p>
          ) : !branchId ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Chọn chi nhánh trước để tải dịch vụ.
            </p>
          ) : loadingServices ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Đang tải dịch vụ...
            </p>
          ) : (
            <div className="space-y-3">
              {selectedVehicles.map((vehicle) => (
                <div
                  key={vehicle.VehicleID}
                  className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{vehicle.LicensePlate}</p>
                    <p className="text-xs text-slate-500">
                      {vehicle.Brand || "Chưa cập nhật"} {vehicle.Model || ""}
                    </p>
                  </div>
                  <select
                    value={vehicleServiceIds[String(vehicle.VehicleID)] || ""}
                    onChange={(event) => setVehicleService(vehicle.VehicleID, event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Chọn dịch vụ cho xe này</option>
                    {services.map((service) => (
                      <option key={service.ServiceID} value={service.ServiceID}>
                        {service.ServiceName} - {formatMoney(service.ActualPrice)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(selectedBranch || selectedVehicles.length > 0 || selectedVehicleServices.some((item) => item.service)) && (
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

          {selectedVehicles.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">
                Xe đã chọn ({selectedVehicleCount})
              </p>
              <div className="mt-3 space-y-2">
                {selectedVehicles.map((vehicle) => (
                  <div key={vehicle.VehicleID} className="flex gap-2">
                    <Car className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span>
                      <span className="font-semibold text-slate-800">
                        {vehicle.LicensePlate}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {vehicle.Brand || "Chưa cập nhật"} {vehicle.Model || ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedVehicleServices.some((item) => item.service) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-950">Dịch vụ đã chọn</p>
              <div className="mt-3 space-y-2">
                {selectedVehicleServices.map(({ vehicle, service }) => (
                  <div key={vehicle.VehicleID}>
                    <p className="font-semibold text-slate-800">
                      {vehicle.LicensePlate}: {service?.ServiceName || "Chưa chọn dịch vụ"}
                    </p>
                    {service && (
                      <p className="text-xs text-slate-500">
                        {formatMoney(service.ActualPrice)} | {service.DurationMinutes || 0} phút
                      </p>
                    )}
                  </div>
                ))}
              </div>
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
              const lacksCapacity = selectedVehicleCount > 0 && slot.Available < selectedVehicleCount;
              const isDisabled =
                slot.Available <= 0 || slot.Status !== "Available" || lacksCapacity;
              const isFull = slot.Available <= 0 || slot.Status !== "Available";

              return (
                <button
                  key={slot.StartTime}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setStartTime(slot.StartTime)}
                  className={`rounded-lg border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                    isSelected
                      ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-100"
                      : isFull
                        ? "border-slate-200 bg-slate-100 text-slate-400"
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
                    {slot.ShiftName} | {slot.StaffCount} nhân viên |{" "}
                    {isFull
                      ? "Hết chỗ"
                      : lacksCapacity
                        ? `Không đủ cho ${selectedVehicleCount} xe`
                        : `Còn ${slot.Available} chỗ`}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Dùng điểm để giảm tiền
        </label>

        <input
          type="number"
          min={0}
          max={availablePoints}
          step={1}
          value={usePoints}
          onChange={(e) => setUsePoints(e.target.value)}
          placeholder="Nhập số điểm muốn dùng"
          className={inputClass}
        />

        <p className="mt-2 text-sm text-slate-600">
          Điểm hiện có: <span className="font-semibold text-slate-900">{availablePoints}</span>. Điểm sẽ được trừ khi thanh toán thành công.
        </p>
      </div>

      <div className="mt-6">
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
