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
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const selectedBranch = branches.find(
    (branch) => branch.BranchID === Number(branchId),
  );

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.VehicleID === Number(vehicleId),
  );

  const selectedService = services.find(
    (service) => service.ServiceID === Number(serviceId),
  );

  const servicePrice = Number(selectedService?.ActualPrice || 0);

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
        setServiceId("");
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

    if (!vehicleId) {
      showMessage("Vui lòng chọn xe");
      return;
    }

    if (!serviceId) {
      showMessage("Vui lòng chọn dịch vụ");
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

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const bookingPayload = {
        BranchID: Number(branchId),
        BookingDate: bookingDate,
        StartTime: startTime,
        Items: [
          {
            VehicleID: Number(vehicleId),
            Services: [
              {
                ServiceID: Number(serviceId),
              },
            ],
          },
        ],
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
            vehicleName: selectedVehicle
              ? `${selectedVehicle.LicensePlate} - ${
                  selectedVehicle.Brand || "Chưa cập nhật"
                } ${selectedVehicle.Model || ""}`
              : "",
            serviceName: selectedService?.ServiceName || "",
            serviceDuration: selectedService?.DurationMinutes || 0,
            servicePrice,
            discountAmount: 0,
            finalPrice: servicePrice,
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
            vehicleId={vehicleId}
            setVehicleId={setVehicleId}
            serviceId={serviceId}
            setServiceId={setServiceId}
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            startTime={startTime}
            setStartTime={setStartTime}
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
            selectedVehicle={selectedVehicle}
            selectedService={selectedService}
            onSubmit={handleSubmit}
          />

          <BookingSummary
            fullName={fullName}
            phone={phone}
            bookingDate={bookingDate}
            startTime={startTime}
            servicePrice={servicePrice}
            selectedBranch={selectedBranch}
            selectedVehicle={selectedVehicle}
            selectedService={selectedService}
          />
        </section>
      </main>
    </div>
  );
}

export default Booking;
