import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BookingForm from "../../components/customer/BookingForm";
import BookingHeader from "../../components/customer/BookingHeader";
import BookingSummary from "../../components/customer/BookingSummary";
import type {
  Branch,
  Service,
  Slot,
  Vehicle,
} from "../../components/customer/bookingTypes";
import axiosClient, { getErrorMessage } from "../../api/axiosClient";

function Booking() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [branchId, setBranchId] = useState("");
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [vehicleServiceIds, setVehicleServiceIds] = useState<Record<string, string>>({});
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [usePoints, setUsePoints] = useState("");
  const [note, setNote] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [tierDiscountPercent, setTierDiscountPercent] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const selectedBranch = branches.find(
    (branch) => branch.BranchID === Number(branchId),
  );

  const selectedVehicles = vehicles.filter((vehicle) =>
    vehicleIds.includes(String(vehicle.VehicleID)),
  );

  const selectedVehicleCount = selectedVehicles.length;
  const selectedSlot = slots.find((slot) => slot.StartTime === startTime);
  const selectedVehicleServices = selectedVehicles.map((vehicle) => {
    const service = services.find(
      (item) => item.ServiceID === Number(vehicleServiceIds[String(vehicle.VehicleID)]),
    );
    return { vehicle, service };
  });
  const servicePrice = selectedVehicleServices.reduce(
    (sum, item) => sum + Number(item.service?.ActualPrice || 0),
    0,
  );
  const pointToMoneyRate = Number(import.meta.env.VITE_POINT_TO_MONEY_RATE || 200);
  const requestedPoints = Number(usePoints || 0);
  const normalizedRequestedPoints = Number.isFinite(requestedPoints)
    ? Math.max(0, Math.floor(requestedPoints))
    : 0;
  const usablePoints = Math.min(normalizedRequestedPoints, availablePoints);
  const tierDiscountAmount = (servicePrice * tierDiscountPercent) / 100;
  const amountAfterTier = Math.max(0, servicePrice - tierDiscountAmount);
  const pointDiscountAmount = Math.min(amountAfterTier, usablePoints * pointToMoneyRate);
  const discountAmount = tierDiscountAmount + pointDiscountAmount;
  const finalPrice = Math.max(0, servicePrice - discountAmount);

  useEffect(() => {
    async function loadBookingData() {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const branchRes = await axiosClient.get("/api/branches?status=Active");
        const profileRes = await axiosClient.get("/api/customers/profile", {
          headers,
        });

        const profile = profileRes.data.data;

        setBranches(branchRes.data.data || []);
        setFullName(profile.Users.FullName || "");
        setPhone(profile.Users.Phone || "");
        setVehicles(profile.Vehicles || []);
        setAvailablePoints(Number(profile.LoyaltyAccounts?.[0]?.CurrentPoints || 0));
        setTierDiscountPercent(Number(profile.LoyaltyAccounts?.[0]?.tier_configs?.DiscountPercent || 0));
      } catch (error) {
        console.log(error);
        setMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadBookingData();
  }, [navigate]);

  useEffect(() => {
    async function loadServices() {
      if (!branchId) {
        setServices([]);
        return;
      }

      try {
        setLoadingServices(true);
        setMessage("");
        setServices([]);
        setVehicleServiceIds({});
        setStartTime("");

        const res = await axiosClient.get(`/api/branches/${branchId}/services`);

        setServices(res.data.data || []);
      } catch (error) {
        console.log(error);
        setMessage(getErrorMessage(error));
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [branchId]);

  useEffect(() => {
    async function loadSlots() {
      if (!branchId || !bookingDate) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        setMessage("");
        setSlots([]);
        setStartTime("");

        const res = await axiosClient.get("/api/bookings/available-slots", {
          params: {
            BranchID: Number(branchId),
            BookingDate: bookingDate,
          },
        });

        setSlots(res.data.data.Slots || []);
      } catch (error) {
        console.log(error);
        setMessage(getErrorMessage(error));
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [branchId, bookingDate]);

  function showMessage(text: string) {
    setMessage(text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim()) {
      showMessage("Vui lòng nhập họ và tên");
      return;
    }

    if (!phone.trim()) {
      showMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!branchId) {
      showMessage("Vui lòng chọn chi nhánh");
      return;
    }

    if (vehicleIds.length === 0) {
      showMessage("Vui lòng chọn ít nhất 1 xe");
      return;
    }

    const missingServiceVehicle = selectedVehicleServices.find((item) => !item.service);
    if (missingServiceVehicle) {
      showMessage(`Vui lòng chọn dịch vụ cho xe ${missingServiceVehicle.vehicle.LicensePlate}`);
      return;
    }

    if (!bookingDate) {
      showMessage("Vui lòng chọn ngày đặt lịch");
      return;
    }

    if (!startTime) {
      showMessage("Vui lòng chọn khung giờ");
      return;
    }

    if (selectedSlot && selectedSlot.Available < vehicleIds.length) {
      showMessage(
        `Khung giờ này chỉ còn ${selectedSlot.Available} chỗ trống, không thể đặt ${vehicleIds.length} xe`,
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const pointsToUse = usePoints.trim() === "" ? 0 : Number(usePoints);
      if (!Number.isFinite(pointsToUse) || pointsToUse < 0 || !Number.isInteger(pointsToUse)) {
        showMessage("Số điểm sử dụng phải là số nguyên không âm");
        return;
      }
      if (pointsToUse > availablePoints) {
        showMessage(`Bạn chỉ có ${availablePoints} điểm để sử dụng`);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const bookingPayload = {
        BranchID: Number(branchId),
        BookingDate: bookingDate,
        StartTime: startTime,
        UsePoints: pointsToUse,
        Items: vehicleIds.map((id) => ({
            VehicleID: Number(id),
            Services: [
              {
                ServiceID: Number(vehicleServiceIds[id]),
              },
            ],
          })),
      };

      const res = await axiosClient.post("/api/bookings", bookingPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/booking-success", {
        state: {
          booking: res.data.data,
          summary: {
            customerName: fullName,
            phone,
            branchName: selectedBranch?.BranchName || "",
            vehicleName: selectedVehicles
              .map(
                (vehicle) =>
                  `${vehicle.LicensePlate} - ${
                    vehicle.Brand || "Chưa cập nhật"
                  } ${vehicle.Model || ""}`.trim(),
              )
              .join(", "),
            vehicleCount: selectedVehicleCount,
            serviceName: selectedVehicleServices
              .map(
                ({ vehicle, service }) =>
                  `${vehicle.LicensePlate}: ${service?.ServiceName || "Chưa chọn"}`,
              )
              .join(", "),
            serviceDuration: Math.max(
              0,
              ...selectedVehicleServices.map((item) => Number(item.service?.DurationMinutes || 0)),
            ),
            vehicleServiceSummary: selectedVehicleServices.map(({ vehicle, service }) => ({
              vehicleName: vehicle.LicensePlate,
              serviceName: service?.ServiceName || "",
              price: Number(service?.ActualPrice || 0),
            })),
            servicePrice,
            tierDiscountPercent,
            tierDiscountAmount,
            pointDiscountAmount,
            discountAmount,
            finalPrice,
            usedPoints: pointsToUse,
            bookingDate,
            startTime,
            note,
          },
        },
      });
    } catch (error) {
      console.log(error);
      showMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <main className="px-6 py-10">
          <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              Đang tải dữ liệu đặt lịch...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        <BookingHeader
          branchCount={branches.length}
          vehicleCount={vehicles.length}
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_380px]">
          <BookingForm
            message={message}
            fullName={fullName}
            setFullName={setFullName}
            phone={phone}
            setPhone={setPhone}
            branchId={branchId}
            setBranchId={setBranchId}
            vehicleIds={vehicleIds}
            setVehicleIds={setVehicleIds}
            vehicleServiceIds={vehicleServiceIds}
            setVehicleServiceIds={setVehicleServiceIds}
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            startTime={startTime}
            setStartTime={setStartTime}
            usePoints={usePoints}
            setUsePoints={setUsePoints}
            availablePoints={availablePoints}
            note={note}
            setNote={setNote}
            branches={branches}
            vehicles={vehicles}
            services={services}
            slots={slots}
            setSlots={setSlots}
            today={today}
            loadingServices={loadingServices}
            loadingSlots={loadingSlots}
            isSubmitting={isSubmitting}
            selectedBranch={selectedBranch}
            selectedVehicles={selectedVehicles}
            selectedVehicleServices={selectedVehicleServices}
            onSubmit={handleSubmit}
          />

          <BookingSummary
            fullName={fullName}
            phone={phone}
            bookingDate={bookingDate}
            startTime={startTime}
            servicePrice={servicePrice}
            selectedVehicleCount={selectedVehicleCount}
            tierDiscountPercent={tierDiscountPercent}
            tierDiscountAmount={tierDiscountAmount}
            usedPoints={usablePoints}
            pointDiscountAmount={pointDiscountAmount}
            discountAmount={discountAmount}
            finalPrice={finalPrice}
            selectedBranch={selectedBranch}
            selectedVehicles={selectedVehicles}
            selectedVehicleServices={selectedVehicleServices}
          />
        </section>
      </main>
    </div>
  );
}

export default Booking;
