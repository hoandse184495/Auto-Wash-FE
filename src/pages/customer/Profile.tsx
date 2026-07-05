import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Car,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import axiosClient from "../../api/axiosClient";
import avatarImg from "../../assets/avatar.png";

type Vehicle = {
  VehicleID: number;
  LicensePlate: string;
  VehicleType?: string | null;
  Brand?: string | null;
  Model?: string | null;
  Color?: string | null;
  Status?: string | null;
};

function Profile() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axiosClient.get("/api/customers/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.data;

        setFullName(data.Users.FullName);
        setEmail(data.Users.Email);
        setPhone(data.Users.Phone || "Chưa cập nhật");
        setVehicles(data.Vehicles || []);
        setTotalVisits(data.TotalVisits || 0);
        setTotalSpent(data.TotalSpent || 0);
      } catch (error: unknown) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };

        console.log(apiError.response?.data || error);
        setMessage(
          apiError.response?.data?.message ||
            "Không thể tải thông tin cá nhân",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  function formatMoney(value: number) {
    return value.toLocaleString("vi-VN") + "đ";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />

        <main className="px-6 py-10">
          <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              Đang tải thông tin cá nhân...
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
        <section className="bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
              <UserRound className="h-4 w-4" />
              Hồ sơ khách hàng
            </p>

            <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  Trang cá nhân
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Theo dõi thông tin tài khoản, thống kê sử dụng dịch vụ và
                  danh sách xe đã lưu trong hệ thống.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Lượt sử dụng</p>
                  <p className="mt-1 text-2xl font-bold">{totalVisits}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm text-slate-300">Xe đã lưu</p>
                  <p className="mt-1 text-2xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-8">
          {message && (
            <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <img
                  src={avatarImg}
                  alt="Avatar"
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-sky-100"
                />

                <h2 className="mt-4 text-2xl font-bold text-slate-950">
                  {fullName || "Người dùng"}
                </h2>

                <p className="mt-1 max-w-full break-words text-sm text-slate-500">
                  {email || "Chưa có email"}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-700">
                  <ShieldCheck className="h-4 w-4" />
                  Khách hàng
                </span>
              </div>
            </aside>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                    Tài khoản
                  </p>
                  <h2 className="text-xl font-bold text-slate-950">
                    Thông tin tài khoản
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<UserRound className="h-5 w-5" />}
                  label="Họ và tên"
                  value={fullName || "Chưa cập nhật"}
                />
                <InfoCard
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={email || "Chưa cập nhật"}
                />
                <InfoCard
                  icon={<Phone className="h-5 w-5" />}
                  label="Số điện thoại"
                  value={phone || "Chưa cập nhật"}
                />
                <InfoCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Vai trò"
                  value="Customer"
                />
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                  Thống kê
                </p>
                <h2 className="text-xl font-bold text-slate-950">
                  Thống kê khách hàng
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <StatCard
                icon={<CalendarDays className="h-6 w-6" />}
                label="Tổng lượt sử dụng"
                value={String(totalVisits)}
              />
              <StatCard
                icon={<Wallet className="h-6 w-6" />}
                label="Tổng chi tiêu"
                value={formatMoney(totalSpent)}
              />
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sky-600">
                  Phương tiện
                </p>
                <h2 className="text-xl font-bold text-slate-950">Xe của tôi</h2>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">
                  Chưa có dữ liệu xe trong hồ sơ của bạn.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <article
                    key={vehicle.VehicleID}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="break-words text-lg font-bold text-sky-700">
                        {vehicle.LicensePlate}
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {vehicle.Status || "Active"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <VehicleLine
                        label="Loại xe"
                        value={vehicle.VehicleType}
                      />
                      <VehicleLine label="Hãng xe" value={vehicle.Brand} />
                      <VehicleLine label="Model" value={vehicle.Model} />
                      <VehicleLine label="Màu xe" value={vehicle.Color} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

type CardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoCard = ({ icon, label, value }: CardProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-sky-600">{icon}</span>
        {label}
      </p>
      <p className="mt-2 break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
};

const StatCard = ({ icon, label, value }: CardProps) => {
  return (
    <div className="rounded-lg bg-slate-950 p-5 text-white">
      <p className="flex items-center gap-2 text-sm text-slate-300">
        <span className="text-sky-300">{icon}</span>
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
};

type VehicleLineProps = {
  label: string;
  value?: string | null;
};

const VehicleLine = ({ label, value }: VehicleLineProps) => {
  return (
    <p>
      <span className="text-slate-500">{label}: </span>
      <span className="font-semibold text-slate-800">
        {value || "Chưa cập nhật"}
      </span>
    </p>
  );
};

export default Profile;
